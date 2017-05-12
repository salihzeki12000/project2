import passport from 'passport';
import { OAuth2Strategy as GoogleStrategy } from 'passport-google-oauth';

export function setup(User, config) {
  passport.use(new GoogleStrategy({
    clientID: config.google.clientID,
    clientSecret: config.google.clientSecret,
    callbackURL: config.google.callbackURL
  },
    function (accessToken, refreshToken, profile, done) {
      User.findOneAsync({
        'google.id': profile.id
      })
        .then(user => {
          if (user) {
            return done(null, user);
          }

          user = new User({
            name: profile.name.givenName,
            email: profile.emails[0].value,
            role: 'user',
            username: profile.emails[0].value.split('@')[0],
            provider: 'google',
            google: profile._json,
            avatar: profile.image
          });
          
          user.saveAsync()
            .then(function (user) {
              return done(null, user[0]);
            })
        })
        .catch(err => done(err));
    }));
}
