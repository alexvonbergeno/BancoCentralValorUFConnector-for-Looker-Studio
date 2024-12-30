const APIURL = "https://si3.bcentral.cl/SieteRestWS/SieteRestWS.ashx"
const TIMESERIES = "F073.UFF.PRE.Z.D"
const FUNCTION = "GetSeries"


function getAuthType() {
  var AuthTypes = cc.AuthType;
  return cc
    .newAuthTypeResponse()
    .setAuthType(AuthTypes.NONE)
    .build();
}

function getConfig() {
  var config = cc.getConfig();

  config
    .newInfo()
    .setId('instructions')
    .setText(
      'Enter email and password of Banco Central account'
    );

  config
    .newTextInput()
    .setId('email')
    .setName(
      'email'
    )
    .setHelpText('user@domain.ext')
    .setPlaceholder('user@domain.ext')
    .setAllowOverride(true);

  config
    .newTextInput()
    .setId('password')
    .setName(
      'password'
    )
    .setHelpText('')
    .setPlaceholder('')
    .setAllowOverride(true);

  return config.build();
}

function getFields() {
  var fields = cc.getFields();
  var types = cc.FieldType;

  fields
    .newDimension()
    .setId('UF')
    .setName('UF')
    .setType(types.NUMBER);

  return fields;
}

function getSchema(request) {
  return {schema: getFields().build()};
}

function getData(request) {
  request.configParams = validateConfig(request.configParams);

  var requestedFields = getFields().forIds(
    request.fields.map(function(field) {
      return field.name;
    })
  );

  try {
    var apiResponse = fetchDataFromApi(request);
    var data = getValue(apiResponse);
  } catch (e) {
    cc.newUserError()
      .setDebugText('Error fetching data from API. Exception details: ' + e)
      .setText(
        'The connector has encountered an unrecoverable error. Please try again later, or file an issue if this error persists.'
      )
      .throwException();
  }

  return {
    schema: requestedFields.build(),
    rows: data
  };
}

/**
 * Gets response for UrlFetchApp.
 *
 * @param {Object} request Data request parameters.
 * @returns {string} Response text for UrlFetchApp.
 */
function fetchDataFromApi(request) {
  const today = new Date()
  const today_string = today.getFullYear().toString() + "-" + today.getMonth().toString() + "-" + today.getDay().toString()
  var url = [
    APIURL,
    '?',
    'user=',
    request.configParams.email,
    '&pass=',
    request.configParams.password,
    '&firstdate=',
    today_string,
    '&lastdate=',
    today_string,
    '&timeseries=',
    TIMESERIES,
    '&function=',
    FUNCTION
  ].join('');
  var response = UrlFetchApp.fetch(url);
  return response;
}

/**
 * Parses response string into an array of {key: value} pairs.
 *
 * @param {string} responseString Response from the API.
 * @return {Array} pairs like UF: value.
 */
function getValue(request, responseString) {
  var response = JSON.parse(responseString);
  return {"UF": parseFloat(response["Series"]["Obs"][0]["value"])}
}
