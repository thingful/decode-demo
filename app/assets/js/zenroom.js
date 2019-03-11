var scripts = {
  generateKey: `
-- generate a simple keyring
keyring = ECDH.new()
keyring:keygen()

-- export the keypair to json
export = JSON.encode(
   {
      public  = keyring: public():base64(),
	  private = keyring:private():base64()
   }
)
print(export)
  `,
  decrypt: `
-- Decryption script for DECODE IoT Pilot

-- data schemas
keys_schema = SCHEMA.Record {
  community_seckey = SCHEMA.String
}

data_schema = SCHEMA.Record {
  header   = SCHEMA.String,
  encoding = SCHEMA.String,
  text     = SCHEMA.String,
  curve    = SCHEMA.String,
  zenroom  = SCHEMA.String,
  checksum = SCHEMA.String,
  iv       = SCHEMA.String
}

-- read and validate data
keys = read_json(KEYS, keys_schema)
data = read_json(DATA, data_schema)

header = MSG.unpack(base64(data.header):str())

community_key = ECDH.new()
community_key:private(base64(keys.community_seckey))

payload, ck = ECDH.decrypt(
  community_key,
  base64(header.device_pubkey),
  map(data, base64)
)

print(JSON.encode(MSG.unpack(payload.text:str())))
  `,
  citizen: {
    generateKeypair: `
-- 0 for silent logging
ZEN:begin(0)

ZEN:parse([[
Scenario 'coconut': "To run over the mobile wallet the first time and store the output as keypair.keys"
  Given that I am known as 'identifier'
  When I create my new keypair
  Then print all data
]])

ZEN:run()
`,
    credentialRequest: `
ZEN:begin(0)

ZEN:parse([[
Scenario 'coconut': "To run after the request keypair is stored (keypair.keys)"
  Given that I am known as 'identifier'
  and I have my credential keypair
  When I request a blind signature of my keypair
  Then print all data
]])

ZEN:run()
    `,
    aggregateCredential: `
-- 0 for silent logging
ZEN:begin(0)

ZEN:parse([[
Scenario 'coconut': "To run by citizen and store the output as credential.json"
        Given that I am known as 'identifier'
        and I have my credential keypair
        When I receive a credential signature 'issuer_identifier'
        and I aggregate the credential into my keyring
        Then print all data
]])

ZEN:run()
    `,
    generateBlindCredential: `
-- 0 for silent logging
ZEN:begin(0)

ZEN:parse([[
Scenario 'coconut': "To run by citizen and send the result blindproof_credential.json to the verifier/checker"
         Given that I am known as 'identifier'
         and I have my credential keypair
         and I use the verification key by 'issuer_identifier'
         and I have a signed credential
         When I aggregate all the verification keys
         and I generate a credential proof
         Then print all data
]])

ZEN:run()
    `
  },
  issuer: {
    generateKeypair: `
ZEN:begin(0)

ZEN:parse([[
Scenario 'coconut': Generate credential issuer keypair
        Given that I am known as 'issuer_identifier'
        When I create my new issuer keypair
        Then print all data
]])

ZEN:run()
    `,
    publishVerifier: `
ZEN:begin(0)

ZEN:parse([[
Scenario 'coconut': "Publish the credential issuer verification key"
        Given that I am known as 'issuer_identifier'
        and I have my issuer keypair
        When I publish my issuer verification key
        Then print all data
]])

ZEN:run()
    `,
    signingRequest: `
-- 0 for silent logging
ZEN:begin(0)

ZEN:parse([[
Scenario 'coconut': "To run by the credential issuer and store the output as ci_signed_credential.json"
        Given that I am known as 'issuer_identifier'
        and I have my issuer keypair
        When I am requested to sign a credential
        and I verify the credential to be true
        and I sign the credential
        Then print all data
]])

ZEN:run()
  `
  },
  verifier: {
    verifyCredential: `
-- 0 for silent logging
ZEN:begin(0)

ZEN:parse([[
Scenario 'coconut': "To run by the checker and prints OK in stdout if verified"
        Given that I use the verification key by 'issuer_identifier'
        and that I have a valid credential proof
        When I aggregate all the verification keys
        and the credential proof is verified correctly
        Then print string 'OK'
]])

ZEN:run()
`
  }
};

export default scripts;