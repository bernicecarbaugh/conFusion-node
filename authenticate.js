var passport = require("passport");
// use passport local strategy which authenticates the username and password
var LocalStrategy = require("passport-local").Strategy;
var User = require("./models/users");
// use jwt strategy which differentiates one user versus another
var JwtStrategy = require("passport-jwt").Strategy;
var ExtractJwt = require("passport-jwt").ExtractJwt;
var jwt = require("jsonwebtoken"); // used to create, sign and verify tokens
var FacebookTokenStrategy = require("passport-facebook-token");

var config = require("./config");

// User.authenticate passport's built in authenticate method lets you authenticate using a username and password; returns a user
exports.local = passport.use(new LocalStrategy(User.authenticate())); // local = authenticated user

// serializeUser = sets id as cookie in browser
passport.serializeUser(User.serializeUser());

// deserializeUser = getting id from the cookie in browser
passport.deserializeUser(User.deserializeUser());

// jwt sign creates the token based on the user and secretKey
exports.getToken = function(user) {
  return jwt.sign(user, config.secretKey, { expiresIn: 3600 }); // 1 hour for testing
};

var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secretKey;
exports.jwtPassport = passport.use(
  new JwtStrategy(opts, (jwt_payload, done) => {
    // jwt_payload = contains header, information and signature
    console.log("JWT payload: ", jwt_payload);
    User.findOne({ _id: jwt_payload._id }, (err, user) => {
      if (err) {
        return done(err, false);
      } else if (user) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    });
  })
);

exports.verifyUser = passport.authenticate("jwt", { session: false });

// exports.verifyUser = (req, res, next) => {
//   passport.authenticate("jwt", { session: false });
// };

exports.verifyAdmin = (req, res, next) => {
  if (req.user.admin) next();
  else {
    var err = new Error("You are not authorized to use this operation.");
    err.statusCode = 404;
    return next(err);
  }
};

exports.verifyAuthor = (req, res, next) => {
  console.log("req.user._id " + req.user._id);
  console.log("req.params.dishId " + req.params.dishId);
  console.log("req.params.commentId " + req.params.commentId);
  const Dishes = require("./models/dishes");
  Dishes.findById(req.params.dishId)
    .then(
      dish => {
        if (dish != null && dish.comments.id(req.params.commentId) != null) {
          console.log(
            "Comment author" + dish.comments.id(req.params.commentId).author._id
          );
          if (
            dish.comments
              .id(req.params.commentId)
              .author._id.equals(req.user._id)
          )
            next();
          else {
            var err = new Error(
              "You are not authorized to use this operation."
            );
            err.statusCode = 404;
            return next(err);
          }
        } else {
          // dish or comment is null
          err = new Error(
            "Could not find dish " +
              req.params.dishId +
              " or comment " +
              req.params.commentId
          );
          err.statusCode = 404;
          return next(err);
        }
      },
      err => next(err)
    )
    .catch(err => next(err));
};

exports.facebookPassport = passport.use(
  new FacebookTokenStrategy(
    {
      clientID: config.facebook.clientId,
      clientSecret: config.facebook.clientSecret
    },
    (accessToken, refreshToken, profile, done) => {
      User.findOne(
        {
          facebookId: profile.id
        },
        (err, user) => {
          if (err) return done(err, false);
          // if user has logged in using facebook before then pass back user
          // else create new user
          if (!err && user !== null) {
            return done(null, user);
          } else {
            user = new User({
              username: profile.displayName
            });
            // profile returned from facebook OAuth has lots of info
            user.facebookId = profile.id;
            user.firstname = profile.name.givenName;
            user.lastname = profile.name.familyName;
            user.save((err, user) => {
              if (err) return done(err, false);
              else return done(null, user);
            });
          }
        }
      );
    }
  )
);
