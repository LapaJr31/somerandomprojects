
import express from "express";
import cookieParser from "cookie-parser";
import methodOverride from "method-override";
import passport from "passport";
import bunyan from "bunyan";
import morgan from "morgan";
import path from 'path';
import config from './config.js'
import {fileURLToPath} from 'url'; 
import flash from "express-flash";
import session from "express-session";
import 'dotenv/config';
import { OIDCStrategy as OIDCStrategy } from "passport-azure-ad";

var log = bunyan.createLogger({
    name: 'dcs-health-status-page-azure-sso'
});

//-----------------------------------------------------------------------------

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// console.log('directory-name ', __dirname);
// console.log(path.join(__dirname, '/dist', 'index.html'));

//-----------------------------------------------------------------------------

const JiraBaseUrl = "https://jira.digitalchargingsolutions.com";
const JiraApiUrl = JiraBaseUrl + "/rest/api/2/search";
const JiraBrowseURL = JiraBaseUrl + "/browse";
const JiraHeaders = {'Content-Type': 'application/json', "Authorization": "Bearer NTA4NzcxMjQ4ODU4OmJETlDWEAJazjVCU8hOmMRr1PyO"};

//-----------------------------------------------------------------------------
var app = express();

passport.serializeUser(function(user, done) {
  done(null, user.oid);
});

passport.deserializeUser(function(oid, done) {
  findByOid(oid, function (err, user) {
    done(err, user);
  });
});

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(morgan('dev'));
app.use(methodOverride());
app.use(cookieParser());

app.use(express.urlencoded({ extended : true }));

app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname + '/../../public'));


//-----------------------------------------------------------------------------

var users = [];

var findByOid = function(oid, fn) {
  for (var i = 0, len = users.length; i < len; i++) {
    var user = users[i];
   log.info('we are using user: ', user);
    if (user.oid === oid) {
      return fn(null, user);
    }
  }
  return fn(null, null);
};

//-----------------------------------------------------------------------------

passport.use(new OIDCStrategy({
  identityMetadata: config.creds.identityMetadata,
  clientID: config.creds.clientID,
  responseType: config.creds.responseType,
  responseMode: config.creds.responseMode,
  redirectUrl: config.creds.redirectUrl,
  allowHttpForRedirectUrl: config.creds.allowHttpForRedirectUrl,
  clientSecret: config.creds.clientSecret,
  validateIssuer: config.creds.validateIssuer,
  isB2C: config.creds.isB2C,
  issuer: config.creds.issuer,
  passReqToCallback: config.creds.passReqToCallback,
  scope: config.creds.scope,
  loggingLevel: config.creds.loggingLevel,
  nonceLifetime: config.creds.nonceLifetime,
  nonceMaxAmount: config.creds.nonceMaxAmount,
  useCookieInsteadOfSession: config.creds.useCookieInsteadOfSession,
  cookieEncryptionKeys: config.creds.cookieEncryptionKeys,
  clockSkew: config.creds.clockSkew,
},
function(iss, sub, profile, accessToken, refreshToken, done) {
  if (!profile.oid) {
    return done(new Error("No oid found"), null);
  }
  // asynchronous verification, for effect...
  process.nextTick(function () {
    findByOid(profile.oid, function(err, user) {
      if (err) {
        return done(err);
      }
      if (!user) {
        // "Auto-registration"
        users.push(profile);
        return done(null, profile);
      }
      return done(null, user);
    });
  });
}
));


//some express stuff

app.set('view-engine', 'html')
app.set('view-engine', 'ejs')
app.use(express.urlencoded({ extended: false }))
app.use(flash())

// app.use(session({
//   secret: process.env.SESSION_SECRET,
//   resave: false,
//   saveUninitialized: false,
//   cookie: { secure: true }
// }))


app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: true }
}))

app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))




//-----------------------------------------------------------------------------

const FilterComponentMobileApp = ["App"];
const FilterComponentCPOG = ["CPO, User & OEM Gateway", "CPO based price", "CPOG", "CPOG: adapter-authorization", "CPOG: adapter-billing", "CPOG: adapter-poi-availability", "CPOG: adapter-poi-static-data", "CPOG: billing", "CPOG: cache-provider", "CPOG: cache-update", "CPOG: CAF: caf", "CPOG: CAF: caf-api", "CPOG: charging-authorization", "CPOG: cpodummy-backend", "CPOG: CPOG Portal (APIM)", "CPOG: Diagnostics Portal: Backend", "CPOG: EMP Gateway (APIM)", "CPOG: EMPP: empproxy-router", "CPOG: pnc", "CPOG: poi-remote-control", "CPOG: service"];
const FilterComponentDVS = ["Data Validation"];
const FilterComponentFleet = ["Fleet", "fleet_advancedFeature", "fleet_BasicSelfService", "fleet_batch_upload", "fleet_batchUpload", "fleet_bulkUpload", "fleet_E2EStabilization", "fleet_HomeWorkPlaceCharging", "fleet_multiLevelSaaS", "fleet_multiLevelSaaS", "fleet_newAdvancedFeature", "fleet_rolloutNewCountries", "fleet_rolloutnewcustomer", "fleet_userselfservice"];
const FilterComponentIDM = ["IDM", "IDM AUDI", "IDM BMW GCDM", "IDM Daimler CIAM", "IDM OEMs", "IDM PSA Objektultur"];
const FilterComponentKNIME = ["KNIME"];
const FilterComponentOIMW = ["OIMW", "OIAPI"];
const FilterComponentOI = ["Open Informer", "Open Infommer", "OpenInformer", "OI", "OI: Backend", "OI: Backend"];
const FilterComponentPOIM = ["POIM", "poim", "POIM_AdminService", "POIM_Importer_Exporter", "POIM: POI Data Administration, Access and Visibility", "POIM: POI Processing", "POIM: POI Processing", "POI Management"];
const FilterComponentWebApp = ["Frontend", "Web", "Web (private/public), Liferay, CMS", "Web-Frontend", "Web Frontent"];

var componentTableSetup = [
  {componentName: "Mobile App", componentFilter: FilterComponentMobileApp, priority: "B"},
  {componentName: "CPOG", componentFilter: FilterComponentCPOG, priority: "A"},
  {componentName: "DVS", componentFilter: FilterComponentDVS, priority: "B"},
  {componentName: "Fleet", componentFilter: FilterComponentFleet, priority: "A"},
  {componentName: "IDM", componentFilter: FilterComponentIDM, priority: "A"},
  {componentName: "KNIME", componentFilter: FilterComponentKNIME, priority: "C"},
  {componentName: "OI MW", componentFilter: FilterComponentOIMW, priority: "A"},
  {componentName: "OI Core", componentFilter: FilterComponentOI, priority: "A"},
  {componentName: "POIM", componentFilter: FilterComponentPOIM, priority: "A"},
  {componentName: "Web App", componentFilter: FilterComponentWebApp, priority: "A"}
];

const JiraQueryClass1 = {
  "jql":"project= DEVCST AND statusCategory != Done AND 'Incident Class (DCS)' = '1 - Class 1, Outage'",
  "startAt":0,
  "maxResults":20
};

const JiraQueryClass2 = {
  "jql":"project= DEVCST AND statusCategory != Done AND 'Incident Class (DCS)' = '2 - Class 2, Degradation'",
  "startAt":0,
  "maxResults":20
};

const JiraQueryClass1AndClass2 = {
  "jql":"project= DEVCST AND statusCategory != Done AND status != 'In Review' AND ('Incident Class (DCS)' = '1 - Class 1, Outage' OR 'Incident Class (DCS)' = '2 - Class 2, Degradation')",
  "startAt":0,
  "maxResults":20
}

async function getJiraIssues(jiraQuery) {
  var response = await fetch(JiraApiUrl, {
    method: "POST",
    headers: JiraHeaders, 
    body: JSON.stringify(jiraQuery)
  })
  return response;
};

//-----------------------------------------------------------------------------

async function getKeysHtmlWithLabel(filteredIssues, labelClass) {
  var keysHtml = "";
    if (filteredIssues.length > 0) {
      var keysHtml = "";
      var keysData = await filteredIssues.map(jiraKey => jiraKey.key);
      keysData.forEach(function(e) {
        keysHtml += '<span class="label ' + labelClass + '"><a href="' + JiraBrowseURL + "/" + e.toString() + '">' + e.toString() + '</a></span>&nbsp;';
      });
    }
    return keysHtml;
};

async function getComponentsTableData(objectOfIssues) {
  var componentTableResult = [];
  var length = componentTableSetup.length;
  for (var i = 0; i < length; i++) {
    var filteredIssues = await objectOfIssues.filter(element => element.fields.components.find(component => componentTableSetup[i].componentFilter.includes(component.name)));
    var component = componentTableSetup[i].componentName;
    var totalCount = filteredIssues.length;
    var componentPriority = componentTableSetup[i].priority;
    var filteredClass1Issues = filteredIssues.filter(element => element.fields.customfield_10412.value === '1 - Class 1, Outage');
    var filteredClass2Issues = filteredIssues.filter(element => element.fields.customfield_10412.value === '2 - Class 2, Degradation');
    var class1Count = filteredClass1Issues.length;
    var class2Count = filteredClass2Issues.length;
    var class1KeysHTML = await getKeysHtmlWithLabel(filteredClass1Issues, "label-primary");
    var class2KeysHTML = await getKeysHtmlWithLabel(filteredClass2Issues, "label-default");

    componentTableResult.push({
      componentName: component,
      issuesCount: totalCount,
      class1IssuesCount: class1Count,
      class1JiraKeys: class1KeysHTML,
      class2IssuesCount: class2Count,
      class2JiraKeys: class2KeysHTML,
      priority: componentPriority
    });
  }
  return componentTableResult
};

async function buildOverallStatus(objectOfIssues) {
  var overallStatusStyle = 'panel-success';
  var overallStatusText = 'All Systems Operational';
  var tableData = await getComponentsTableData(objectOfIssues)
  var componentsWithClass1Failure = tableData.filter(element => element.class1IssuesCount > 0);
  var componentsWithClass2Failure = tableData.filter(element => element.class2IssuesCount > 0);

  if (componentsWithClass1Failure.some(element => element.priority === "A")) {
    overallStatusStyle = 'panel-danger';
    overallStatusText = 'Critical Systems Not Operational - Service Outage';
  } else if (componentsWithClass1Failure.some(element => element.priority === "B") || componentsWithClass2Failure.some(element => element.priority === "A")) {
    overallStatusStyle = 'panel-warning';
    overallStatusText = 'Not All Systems Operational - Medium impact';
  } else if (componentsWithClass1Failure.some(element => element.priority === "C") || componentsWithClass2Failure.some(element => element.priority === "B")) {
    overallStatusStyle = 'panel-info';
    overallStatusText = 'Not All Systems Operational - Low impact';
  }

  var overallStatusHTML = '<div class="panel '+ overallStatusStyle + '"><div class="panel-heading"><h3 class="panel-title">' + overallStatusText + '</h3></div></div>';

  return overallStatusHTML;
};

async function buildTableBody(objectOfIssues) {
  var tableData = await getComponentsTableData(objectOfIssues);
  tableData.forEach(function(e) {console.log(e.componentName + " " + e.issuesCount + " "  + e.class1IssuesCount + " "  + e.class2IssuesCount/* + " " + e.class1JiraKeys + " " + e.class2JiraKeys*/);});
  var tableBody = "";
  tableData.forEach(function(e) {
    if (e.class1IssuesCount > 0) {
      var labelStatus = "label-danger";
      var labelText = e.issuesCount + " Open Issues(s)"
    } else if (e.class2IssuesCount > 0) {
      var labelStatus = "label-warning";
      var labelText = e.issuesCount + " Open Issues(s)"
    } else {
      var labelStatus = "label-success"
      var labelText = "All good"
    }
    tableBody += '<div class="list-group-item">' +
                    '<h4 class="list-group-item-heading">' + e.componentName + '</h4>' + 
                    '<p class="list-group-item-text">' +
                        e.class1JiraKeys + e.class2JiraKeys +
                        '<span class="label ' + labelStatus + '">' + labelText + '</span>' +
                    '</p>' + 
                  '</div>';
  });
  return tableBody;
}

async function buildHtml(objectOfIssues) {
  var tableBody = await buildTableBody(objectOfIssues);

  var header = '<link href="//maxcdn.bootstrapcdn.com/bootstrap/3.3.0/css/bootstrap.min.css" rel="stylesheet" id="bootstrap-css"><script src="//maxcdn.bootstrapcdn.com/bootstrap/3.3.0/js/bootstrap.min.js"></script><script src="//code.jquery.com/jquery-1.11.1.min.js"></script>';
  var style = '<style> a { color: white !important;} h4 {display: inline-block;} p {display: inline-block; float: right;}</style>';
  var bodyScripts = '<link href="//netdna.bootstrapcdn.com/font-awesome/4.0.3/css/font-awesome.min.css" rel="stylesheet" type="text/css" />';
  
  var overallStatusPanel = await buildOverallStatus(objectOfIssues);
  var table = '<div class="row clearfix"><div class="col-md-12 column"><div class="list-group">' + tableBody + '</div></div></div>';
  
  var body = '<div class="container"><div class="row"><div class="col-md-12"><h1>DCS Platform Status Page</h1></div></div>' +
                 '<div class="row clearfix"><div class="col-md-12 column">' + overallStatusPanel + table + '</div></div>' +
             '</div>';

  return '<!DOCTYPE html>'
       + '<html><head>' + style + header + '</head><body>' + bodyScripts + body + '</body></html>';
};

//-----------------------------------------------------------------------------
  
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login');
};


app.get('/', function(req, res) {
  res.render('login', { user: req.user });
});


app.get('/login',
  function(req, res, next) {
    passport.authenticate('azuread-openidconnect', 
      { 
        response: res,          
        successRedirect: '/status',
        failureRedirect: '/' 
      }
    )(req, res, next);
  },
  function(req, res) {
    log.info('Login was called in the Sample');
    res.redirect('/');
});

app.get('/auth/openid/return',
  function(req, res, next) {
    passport.authenticate('azuread-openidconnect', 
      { 
        response: res,    
        failureRedirect: '/'  
      }
    )(req, res, next);
  },
  function(req, res) {
    log.info('We received a return from AzureAD.');
    res.redirect('/');
  });

  app.post('/auth/openid/return',
  function(req, res, next) {
    passport.authenticate('azuread-openidconnect', 
      { 
        response: res,    
        failureRedirect: '/'  
      }
    )(req, res, next);
  },
  function(req, res) {
    log.info('We received a return from AzureAD.');
    res.redirect('/');
  });

  // status page - get the data from the API and render the page

app.get('/status', ensureAuthenticated, async function (req, res, next) {

  console.log(req.user);
  res.render('account', { user: req.user });

  if(req.url === '/favicon.ico') {    
    res.writeHead(200, {'Content-Type': 'image/x-icon'});
    res.end('');
  } else {
    var response = await getJiraIssues(JiraQueryClass1AndClass2);
    var obj = await response.json();
    var html = await buildHtml(obj.issues);
    
    res.writeHead(200, {
      'Content-Type': 'text/html',
      'Content-Length': html.length,
      'Expires': '-1',
      'Pragma': 'no-cache',
      'Cache-Control': 'private, no-cache, no-store, must-revalidate'
    }); 
    res.end(html);
  }

  app.get('/logout')

// write an app.get('/logout') route that logs the user out of passport and destroys the session with AAD.
app.get('/logout', function(req, res){
  req.session.destroy(function(err) {
    req.logOut();
    res.redirect(config.destroySessionUrl);
  });
}
);




}).listen(8080);



                      
          
          
  