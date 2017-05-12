import passport from 'passport';
import { Strategy as FacebookStrategy } from 'passport-facebook';

export function setup(User, config) {
  passport.use(new FacebookStrategy({
    clientID: config.facebook.clientID,
    clientSecret: config.facebook.clientSecret,
    callbackURL: config.facebook.callbackURL,
    profileFields: ['emails', 'age_range', 'id', 'about', 'currency', 'gender', 'first_name', 
    'last_name', 'locale', 'displayName', 'friends', 'picture']
  },
    function (accessToken, refreshToken, profile, done) {
      User.findOneAsync({
        'facebook.id': profile.id
      })
        .then(user => {
          if (user) {
            return done(null, user);
          }
          var email = '';
          if ('emails' in profile){
            email = profile.emails[0].value;
          }
          user = new User({
            name: profile.displayName.split(' ')[0],
            email: email,
            role: 'user',
            provider: 'facebook',
            facebook: profile._json
          });
          user.saveAsync()
            .then(function (user) {
              return done(null, user[0]);
            })
        })
        .catch(err => done(err));
    }));
}
