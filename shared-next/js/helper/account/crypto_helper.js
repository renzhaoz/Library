/**
 * Encrypt/Decrypt account-manager's data with key pair.
 *
 * To get information from account-manager activity, we must provide a public
 * key for system app to encode confidential information and send back
 * encryption information. Then we can use the private key to decrypt it and
 * get the raw data.
 */

(function accountCryptoHelper(exports) {
  const AccountCryptoHelper = (function AccountCryptoHelper() {
    const ACCOUNT_MANAGER_CODEC = {
      ASYMMETRIC_ALGORITHM: 'RSA-OAEP',
      SYMMETRIC_ALGORITHM: 'AES-GCM'
    };
    let keyPair = null;
    let keyPromise = null;

    const _exportKey = () => {
      return window.crypto.subtle
        .exportKey('jwk', keyPair.publicKey)
        .catch(err => console.error('exportKey: ', err));
    };

    const _decryptResponse = (symmetricKey, encrypted, iv) => {
      const dec = new TextDecoder();

      return window.crypto.subtle
        .decrypt(
          {
            name: ACCOUNT_MANAGER_CODEC.SYMMETRIC_ALGORITHM,
            iv
          },
          symmetricKey,
          encrypted
        )
        .then(decryptedText => JSON.parse(dec.decode(decryptedText)))
        .catch(err => console.error('decryptResponse: ', err));
    };

    // Generate an encryption key pair: public key and private key.
    const generateKey = () => {
      return window.crypto.subtle
        .generateKey(
          {
            name: ACCOUNT_MANAGER_CODEC.ASYMMETRIC_ALGORITHM,
            /**
             * TODO: should use 2048 or 4096; 1024 is less security!
             * But the running time is too long for now (1000 ~ 5000ms) if we
             * use 2048.
             */
            modulusLength: 1024,
            publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
            hash: 'SHA-256'
          },
          true,
          ['wrapKey', 'unwrapKey']
        )
        .then(key => {
          keyPair = key;
          return _exportKey();
        })
        .catch(err => console.error('generateKey: ', err));
    };

    const getKey = () => (keyPromise ||= generateKey());

    // Decrypto data by private key
    const unwrapKey = encryptedText => {
      const { encrypted, symmetricKey, iv } = encryptedText;

      return window.crypto.subtle
        .unwrapKey(
          'raw',
          symmetricKey, // The key you want to unwrap
          keyPair.privateKey,
          {
            name: ACCOUNT_MANAGER_CODEC.ASYMMETRIC_ALGORITHM,
            hash: { name: 'SHA-256' }
          },
          {
            name: ACCOUNT_MANAGER_CODEC.SYMMETRIC_ALGORITHM,
            length: 256
          },
          false,
          ['decrypt']
        )
        .then(key => _decryptResponse(key, encrypted, iv))
        .catch(err => console.error('unwrapKey: ', err));
    };

    return {
      getKey,
      generateKey,
      unwrapKey
    };
  })();

  exports.AccountCryptoHelper = AccountCryptoHelper;
})(window);
