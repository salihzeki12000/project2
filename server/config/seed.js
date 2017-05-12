/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';
import Thing from '../api/thing/thing.model';
import User from '../api/user/user.model';
import Itinerary from '../api/itinerary/itinerary.model';

Thing.find({}).removeAsync()
  .then(() => {
    Thing.create({
      name: 'Development Tools',
      info: 'Integration with popular tools such as Bower, Grunt, Babel, Karma, ' +
             'Mocha, JSHint, Node Inspector, Livereload, Protractor, Jade, ' +
             'Stylus, Sass, and Less.'
    }, {
      name: 'Server and Client integration',
      info: 'Built with a powerful and fun stack: MongoDB, Express, ' +
             'AngularJS, and Node.'
    }, {
      name: 'Smart Build System',
      info: 'Build system ignores `spec` files, allowing you to keep ' +
             'tests alongside code. Automatic injection of scripts and ' +
             'styles into your index.html'
    }, {
      name: 'Modular Structure',
      info: 'Best practice client and server structures allow for more ' +
             'code reusability and maximum scalability'
    }, {
      name: 'Optimized Build',
      info: 'Build process packs up your templates as a single JavaScript ' +
             'payload, minifies your scripts/css/images, and rewrites asset ' +
             'names for caching.'
    }, {
      name: 'Deployment Ready',
      info: 'Easily deploy your app to Heroku or Openshift with the heroku ' +
             'and openshift subgenerators'
    });
  });

  Itinerary.find({}).removeAsync()
  .then(() => {
    Itinerary.create({
      name: 'itinerary 1',
      description: 'Integration with popular tools such as Bower, Grunt, Babel, Karma, ' +
             'Mocha, JSHint, Node Inspector, Livereload, Protractor, Jade, ' +
             'Stylus, Sass, and Less.',
      active: true,
      owner:'5891184910cc91023c4fbdc1',
      activities:[1,2,3,4,5],
      numdays:4,
      days:[{
        day:1,
        activities:[{},{actid:1,rank:'5.0',acttype:'Shopping',name:'Taxi TCO',photo_reference:'CoQBdwAAADr9_ii6RrdMjloAXvlzbWxN7uCh89LaC9ONZiyYZkXKCagA_oGDdiu6K6hT13pgJYJoL1BvOZL61DVMr-9YKxgzYucoE5JscD016b40m2Cib3nkLKRrSF5M6eQAHQrFmYZgrrW8q3NHLa26Vso_jsec3238FeG_Bornh4bgJVvCEhBg67FGM5ujw5R4cAnG6rWTGhSaHcYrwe1J3WslODsOwaOevnwXbg'},
        {actid:2,rank:'4.8',acttype:'Shopping',name:'Taxi de Hart',photo_reference:'CoQBdwAAABALAA9Ds9Q55dOENoYuCMvjMRtCLYKXhUPzefVSawKstPe_sq-BEkkcFA5Le4vBuWB_53za5B-7wsgyNQTOtyPAZ40Ld6gUdi1FB9p6FV7tOEFgCMxUVVjwAOsPTGlW2gcWryiuaB2pVbWO9FHYvtLZP9wYLBoqk_smgK-e-uV1EhBMAkClkpD-zVyZ7RLrZw1SGhTX35s4lnMJkR4Fd_yPvp-MBPgg2Q'}]
      },
      {
        day:2,
        activities:[{},{actid:3,rank:'4.5',acttype:'Sightseeing',name:'Saint Johns Cathedral',photo_reference:'CoQBdwAAAG-shnl6mdnfOIvXk2yLi_oI5bjQo4he2yl35b_-Xz-dzFMJwLueAZgJ1llEA354E-eSS3U5duBUMlXDlwS5ZVOb-7WPzoA0XZq8W1zfZT7HiR8dy8U2gZ2LGr09KBg7nfJGYpksoyMGyKefmXcdq-4uZ3vUw7mdvrUXTvEE6c3jEhAPaXzITSyPkYRD9oeuS-j_GhTSN3RPpSJ1SeKJ8ELNxeomrAFGyw'},
        {actid:5,rank:'4.5',acttype:'Sightseeing',name:'Town Hall',photo_reference:'CoQBdwAAAMMhc4D3ceIZb75FsgbthW4S0m__8V0HCIrASxMWKIpys453777OH2SiE678onfBnjw1IRM8RIIdbyURGSAhdpdsfV7Ua1cyjnXZtzUP5eja7J_Qrexz7hky2tsDnNl5liRYWzbLGByjqpde_BQr6p-68AuFJUGP3SVnJksV7BrXEhBmF08g9ek1utzCsFYy2pj2GhTD5L-n62pSXEcyNOXURiyAY2G4eg'},
        {actid:6,rank:'4.1',acttype:'Sightseeing',name:'The North Brabant Museum',photo_reference:'CoQBdwAAAJHir9L4e2PxbzFv_CDC7p-b6p2CsS0f8gvQrj00lT69KMxWHuQOBajfilnavYqwO0QRzp3JBifQ0kntC1vJHH_aX9XHubhOp3KaizgPbIWPFAMP71-FFY_o2pI6xSDVr9tjlwMkqVVJrUCOjtDpY089rRiPhyHL6aVEYZSZIcAEEhDlLbiQyFShKfdMytfqlpQfGhTP9wegDnyez9s4gasdnrCj1y2r_A'}]
      },
      {
        day:3,
        activities:[{}]
      },
      {
        day: 4,
        activities:[{}]
      }]
    });
  });

User.find({}).removeAsync()
  .then(() => {
    User.createAsync({
      provider: 'local',
      name: 'Test User',
      email: 'test@example.com',
      password: 'test',
      itinerary: [1,2,3,4,5]
    }, {
      provider: 'local',
      role: 'admin',
      name: 'Admin',
      email: 'admin@example.com',
      password: 'admin',
      itinerary: [1,2,3,4,5]
    })
    .then(() => {
      console.log('finished populating users');
    });
  });
