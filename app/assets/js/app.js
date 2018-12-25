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

let channel = socket.channel("decode:lobby", {})

channel.join()
  .receive("ok", resp => { console.log("Joined successfully", resp) })
  .receive("error", resp => { console.log("Unable to join", resp) })


channel.on("new_policy", (payload) => {
  console.log(payload);
});

$('#create-form').on('submit', function (e) {
  e.preventDefault();
  createPolicy();
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

