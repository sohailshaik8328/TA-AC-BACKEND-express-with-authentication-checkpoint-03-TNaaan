var GitHubStrategy = require('passport-github').Strategy;
var User = require('../models/User');
var GoogleStrategy = require('passport-google-oauth20').Strategy;
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/auth/google/callback',
    },
    function (accessToken, refreshToken, profile, cb) {
      console.log(profile);
      var email = profile._json.email;
      var googleUser = {
        email: email,
        providers: [profile.provider],
        google: {
          name: profile._json.name,
          username: `${profile.name.familyName} ${profile.name.givenName}`,
          image: profile.photos[0].value,
        },
      };
      User.findOne({ email }, (err, user) => {
        if (err) return cb(err, false);
        if (!user) {
          User.create(googleUser, (err, user) => {
            if (err) return cb(err, false);
            cb(null, user);
          });
        } else if (user.providers.includes(profile.provider)) {
          return cb(err, user);
        } else {
          user.providers.push(profile.provider);
          user.google = { ...googleUser.google };
          user.save((err, updatedUser) => {
            cb(null, updatedUser);
          });
        }
      });
    }
  )
);

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: '/auth/github/callback',
    },
    (accessToken, refreshToken, profile, cb) => {
      console.log(profile);
      var email = profile._json.email;
      var githubUser = {
        email: email,
        providers: [profile.provider],
        github: {
          name: profile.displayName,
          username: profile.username,
          image: profile.photos[0].value,
        },
      };
      User.findOne({ email }, (err, user) => {
        if (err) return cb(err, false);
        if (!user) {
          User.create(githubUser, (err, user) => {
            if (err) return cb(err, false);
            cb(null, user);
          });
        } else if (user.providers.includes(profile.provider)) {
          return cb(err, user);
        } else {
          user.providers.push(profile.provider);
          user.github = { ...githubUser.github };
          user.save((err, updatedUser) => {
            cb(null, updatedUser);
          });
        }
      });
    }
  )
);

passport.serializeUser((user, cb) => {
  console.log('this is serialised user', user.id);
  cb(null, user.id);
});
passport.deserializeUser(function (id, cb) {
  User.findById(id, function (err, user) {
    cb(null, user);
  });
});
