// We need to import the CSS so that webpack will load it.
// The MiniCssExtractPlugin is used to separate it out into
// its own CSS file.
import css from '../css/app.css'

// webpack automatically bundles all modules in your
// entry points. Those entry points can be configured
// in 'webpack.config.js'.
//
// Import dependencies
//
import 'phoenix_html'
import Instascan from 'instascan';
import QRCode from 'qrcode';

// Import local files
//
// Local files can be imported directly using relative paths, for example:
import socket from './socket'
import scripts from './zenroom';

_.templateSettings = {
  evaluate: /<<([\s\S]+?)>>/g,
  interpolate: /<<=([\s\S]+?)>>/g,
  escape: /<<-([\s\S]+?)>>/g
};

let channel = socket.channel('decode:lobby', {})

var policies;

var scanner;

channel.join()
  .receive('ok', resp => { console.log('Joined successfully', resp) })
  .receive('error', resp => { console.log('Unable to join', resp) })


channel.on('new_policy', (payload) => {
  console.log(payload);
  let template = _.template($('script.template#policy-template').html());
  $('#policy-details').html(template(payload));
});

channel.on('error', (payload) => {
  console.log(payload);
  let template = _.template($('script.template#alert-template').html());
  $('#alerts').html(template({ level: 'danger', message: payload.msg }));
});

channel.on('policy_deleted', (payload) => {
  console.log(payload);
  let template = _.template($('script.template#alert-template').html());
  $('#alerts').html(template({ level: 'success', message: 'Policy deleted successfully' }));
  $('#policy-id').val('');
  $('#policy-token').val('');
});

channel.on('policies_loaded', (payload) => {
  policies = payload.policies;
  console.log(policies);
  let template = _.template($('script.template#alert-template').html());
  $('#alerts').html(template({ level: 'success', message: 'Policies loaded successfully' }));

  $('#policy-select').empty();

  $('#policy-select').append($('<option>', { value: '', text: 'Please choose a policy to apply' }));

  _.each(policies, function (p) {
    $('#policy-select').append($('<option>', { value: p.policy_id, text: p.label }));
  });
});

channel.on('new_stream', (payload) => {
  console.log(payload);
  $('#stream-uid').val(payload.stream_uid);
  $('#stream-token').val(payload.token);
  let template = _.template($('script.template#alert-template').html());
  $('#stream-alert').html(template({ level: 'success', message: 'Successfully created stream, please note the following details as you will need them to delete the stream' }));
});

channel.on('data', (payload) => {
  console.log(payload);
  if (payload.events.length === 0) {
    $('#data').val('NO DATA YET');
  } else {
    $('#data').val(JSON.stringify(payload.events));
    let template = _.template($('script.template#alert-template').html());
    $('#alerts').html(template({ level: 'success', message: 'Read data successfully' }));
  }
});

$(document).ready(() => {
  let startTime = moment().subtract(5, 'minutes');
  let endTime = moment();

  $('#start-date').val(startTime.format('YYYY-MM-DD'));
  $('#start-time').val(startTime.format('HH:mm'));
  $('#end-date').val(endTime.format('YYYY-MM-DD'));
  $('#end-time').val(endTime.format('HH:mm'));

  initializeScanner();
});

$('#create-form').on('submit', function (e) {
  e.preventDefault();
  createPolicy();
});

$('#delete-form').on('submit', function (e) {
  e.preventDefault();
  deletePolicy();
});

$('#create-stream-form').on('submit', function (e) {
  e.preventDefault();
  createStream();
});

$('#delete-stream-form').on('submit', function (e) {
  e.preventDefault();
  deleteStream();
});

$('#read-data-form').on('submit', function (e) {
  e.preventDefault();
  readData();
});

$('#decrypt-data-form').on('submit', function (e) {
  e.preventDefault();
  decryptData();
});

$('#add-operation').on('click', function () {
  let template = _.template($('script.template#operation-template').html());
  $('#operations-container').append(template());
});

$('#new-key-btn').on('click', function () {
  generateKey();
});

$('#load-policies-btn').on('click', function () {
  channel.push('load_policies', {});
});

$('#policy-select').on('change', function () {
  console.log(policies);

  let policyId = $(this).val();
  let policy = _.find(policies, function (p) { return p.policy_id === policyId });

  if (policy) {
    let template = _.template($('script.template#policy-template').html());
    $('#policy-container').html(template(policy));
    $('#policy-value').val(JSON.stringify(policy));
  }
});

$('#video-container').on('show.bs.collapse', () => {
  $('#toggle-camera-button').html('Stop Camera');

  Instascan.Camera.getCameras().then(function (cameras) {
    if (cameras.length > 0) {
      scanner.start(cameras[0]);
    } else {
      console.error('No cameras found.');
    }
  }).catch(function (e) {
    console.error(e);
  });
});

$('#video-container').on('hide.bs.collapse', () => {
  $('#toggle-camera-button').html('Start Camera');
  scanner.stop();
});

$('.code-input').on('change keyup', (e) => {
  updateQRCode();
});

function createPolicy() {
  var pubkey = $('#pubkey').val();
  var label = $('#label').val()

  var createPolicyMsg = {
    'public_key': pubkey,
    'label': label,
    'operations': []
  };

  $('.operation').each(function () {
    let element = $(this);

    let operation = {
      'sensor_id': parseInt(element.find('input[name="sensor_id"]').val()),
      'action': element.find('select[name="action"]').val()
    }

    let bins = element.find('input[name="bins"]').val();
    if (bins !== '') {
      operation['bins'] = bins.split(',').map((v) => { return parseFloat(v) });
    }

    let interval = element.find('input[name="interval"]').val();
    if (interval !== '') {
      operation['interval'] = parseInt(interval);
    }

    createPolicyMsg.operations.push(operation);
  });

  console.log(createPolicyMsg);

  channel.push('create_policy', createPolicyMsg);
}

function deletePolicy() {
  var policyId = $('#policy-id').val();
  var policyToken = $('#policy-token').val();

  var deletePolicyMsg = {
    'policy_id': policyId,
    'token': policyToken,
  };

  console.log(deletePolicyMsg);

  channel.push('delete_policy', deletePolicyMsg);
}

function generateKey() {
  console.log('generating key');
  final_output = '';
  Module.ccall('zenroom_exec',
    'number',
    ['string', 'string', 'string', 'string', 'number'],
    [scripts.generateKey, null, null, null, 1]
  );
  let parsedResponse = JSON.parse(final_output);
  $('#pubkey').val(parsedResponse.public);
  $('#privkey').val(parsedResponse.private);
}

function decryptData() {
  console.log('decrypting data');
  let privateKey = $('#private-key').val();
  let data = JSON.parse($('#data').val());
  let keys = `{"community_seckey":"${privateKey}"}`;
  let event = data[0];

  console.log(keys);
  console.log(event);

  final_output = '';
  Module.ccall('zenroom_exec',
    'number',
    ['string', 'string', 'string', 'string', 'number'],
    [scripts.decrypt, null, keys, atob(event.data), 1]
  );

  let parsedResponse = JSON.parse(final_output);
  $('#decrypted-data').val(parsedResponse.data);
}

function createStream() {
  var deviceToken = $('#device-token').val();
  var longitude = $('#longitude').val();
  var latitude = $('#latitude').val();
  var exposure = $('input[name="exposure"]:checked').val();
  var policy = JSON.parse($('#policy-value').val());

  var createStreamMsg = {
    'device_token': deviceToken,
    'policy_id': policy.policy_id,
    'recipient_public_key': policy.public_key,
    'location': {
      'longitude': longitude,
      'latitude': latitude
    },
    'exposure': exposure,
    'operations': policy.operations
  };

  console.log(createStreamMsg);

  channel.push('create_stream', createStreamMsg);
}

function deleteStream() {
  let streamUid = $('#stream-uid').val();
  let token = $('#stream-token').val();

  let deleteStreamMsg = {
    'stream_uid': streamUid,
    'token': token
  };

  channel.push('delete_stream', deleteStreamMsg);
}

function readData() {
  let policyId = $('#policy-id').val(),
    startDate = moment(`${$('#start-date').val()}T${$('#start-time').val()}`),
    endDate = moment(`${$('#end-date').val()}T${$('#end-time').val()}`);

  let readRequestMsg = {
    policy_id: policyId,
    start_time: startDate.format(),
    end_time: endDate.format()
  };

  console.log(readRequestMsg);
  channel.push('read_data', readRequestMsg);
}

function updateQRCode() {
  let token = $('#device-token').val();
  let longitude = $('#longitude').val();
  let latitude = $('#latitude').val();
  let exposure = $('input[name="exposure"]:checked').val();

  setQRCode({
    exposure: exposure,
    token: token,
    longitude: longitude,
    latitude: latitude
  });
}

function setQRCode(obj) {
  let element = $('#onboarding-code')[0];
  if (element) {
    QRCode.toCanvas(element, JSON.stringify(obj), { scale: 8 }, (error) => {
      if (error) {
        console.log(error);
      }
    });
  }
}


function initializeScanner() {
  let element = $('#preview')[0];
  if (element) {
    scanner = new Instascan.Scanner({ video: element });
    scanner.addListener('scan', (content) => {
      let onboardingInfo = JSON.parse(content);
      $('#device-token').val(onboardingInfo.token);
      $('#longitude').val(onboardingInfo.longitude);
      $('#latitude').val(onboardingInfo.latitude);
      if (onboardingInfo.exposure === "INDOOR") {
        $('#exposure-indoor').prop('checked', true);
      } else {
        $('#exposure-outdoor').prop('checked', true);
      }
    });
  }
}