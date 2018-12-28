// We need to import the CSS so that webpack will load it.
// The MiniCssExtractPlugin is used to separate it out into
// its own CSS file.
import css from "../css/app.css"

// webpack automatically bundles all modules in your
// entry points. Those entry points can be configured
// in "webpack.config.js".
//
// Import dependencies
//
import "phoenix_html"

// Import local files
//
// Local files can be imported directly using relative paths, for example:
import socket from "./socket"
import scripts from "./zenroom";

_.templateSettings = {
  interpolate: /\{\{(.+?)\}\}/g
};

let channel = socket.channel("decode:lobby", {})

channel.join()
  .receive("ok", resp => { console.log("Joined successfully", resp) })
  .receive("error", resp => { console.log("Unable to join", resp) })


channel.on("new_policy", (payload) => {
  console.log(payload);
  let template = _.template($('script.template#policy-template').html());
  $('#policy-details').html(template(payload));
});

channel.on("error", (payload) => {
  console.log(payload);
  let template = _.template($('script.template#alert-template').html());
  $('#alerts').html(template({ level: 'danger', message: payload.msg }));
});

channel.on("policy_deleted", (payload) => {
  console.log(payload);
  let template = _.template($('script.template#alert-template').html());
  $('#alerts').html(template({ level: 'success', message: 'Policy deleted successfully' }));
  $('#policy-id').val('');
  $('#policy-token').val('');
});

$('#create-form').on('submit', function (e) {
  e.preventDefault();
  createPolicy();
});

$('#delete-form').on('submit', function (e) {
  e.preventDefault();
  deletePolicy();
});

$('#add-operation').on('click', function () {
  let template = _.template($('script.template#operation-template').html());
  $('#operations-container').append(template());
});

$('#new-key-btn').on('click', function () {
  generateKey();
});

function createPolicy() {
  var pubkey = $('#pubkey').val();
  var label = $('#label').val()

  var createPolicyMsg = {
    "public_key": pubkey,
    "label": label,
    "operations": []
  };

  $('.operation').each(function () {
    let element = $(this);

    let operation = {
      "sensor_id": parseInt(element.find('input[name="sensor_id"]').val()),
      "action": element.find('select[name="action"]').val()
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
    "policy_id": policyId,
    "token": policyToken,
  };

  console.log(deletePolicyMsg);

  channel.push('delete_policy', deletePolicyMsg);
}

function generateKey() {
  console.log("generating key");
  final_output = "";
  Module.ccall('zenroom_exec',
    'number',
    ['string', 'string', 'string', 'string', 'number'],
    [scripts.generateKey, null, null, null, 1]
  );
  let parsedResponse = JSON.parse(final_output);
  $('#pubkey').val(parsedResponse.public);
  $('#privkey').val(parsedResponse.private);
}