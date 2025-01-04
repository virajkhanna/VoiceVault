<?php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/log.txt'); 

/*

----------------------------------UNUSED CODE - DO NOT USE----------------------------------

function encrypt($data, $password, $method) {
    $key = hash('sha256', $password, true);
    $iv = openssl_random_pseudo_bytes(openssl_cipher_iv_length($method));

    $encryptedData = openssl_encrypt($data, $method, $key, OPENSSL_RAW_DATA, $iv);

    $encryptedFileName = 'encrypted_' . time() . '.vault';
    file_put_contents($encryptedFileName, $iv . $encryptedData);

    return $encryptedFileName;
}

function decrypt($data, $password, $method) {
    $key = hash('sha256', $password, true);
    $iv = substr($data, 0, openssl_cipher_iv_length($method));
    $data = substr($data, openssl_cipher_iv_length($method));

    $decryptedData = openssl_decrypt($data, $method, $key, OPENSSL_RAW_DATA, $iv);

    $decryptedFileName = 'decrypted_' . time() . '.wav';
    file_put_contents($decryptedFileName, $decryptedData);

    return $decryptedFileName;
}

----------------------------------UNUSED CODE - DO NOT USE----------------------------------

*/

function log_message($message) {
    error_log($message);
}

function encrypt1($data, $passwd) {
    log_message("Starting encryption process...");

    $content = $data;
    log_message("Original content length: " . strlen($content));

    $ivLen = openssl_cipher_iv_length('aes-256-cbc');
    $iv = openssl_random_pseudo_bytes($ivLen);
    log_message("Generated IV length: " . strlen($iv));

    $passkey = hash('sha256', $passwd, true);
    log_message("Generated key");

    $enc_content = openssl_encrypt($content, 'aes-256-cbc', $passkey, OPENSSL_RAW_DATA, $iv);
    log_message("Encrypted content length: " . strlen($enc_content));

    $encryptedFileName = 'encrypted_' . time() . '.vault';
    file_put_contents($encryptedFileName, $iv . $enc_content);

    return $encryptedFileName;
}

function decrypt1($data, $passwd) {
    log_message("Starting decryption process...");

    $ivLen = openssl_cipher_iv_length('aes-256-cbc'); 
    $iv = substr($data, 0, $ivLen); 
    $encryptedData = substr($data, $ivLen); 

    log_message("Extracted IV length: " . strlen($iv));
    log_message("Encrypted data length: " . strlen($encryptedData));

    $key = hash('sha256', $passwd, true);
    log_message("Generated key");

    $decryptedData = openssl_decrypt($encryptedData, 'aes-256-cbc', $key, OPENSSL_RAW_DATA, $iv);

    if ($decryptedData === false) {
        log_message("Decryption failed: " . openssl_error_string());
        return false;
    }

    log_message("Decryption successful. Decrypted content length: " . strlen($decryptedData));

    $decryptedFileName = 'decrypted_' . time() . '.wav';
    file_put_contents($decryptedFileName, $decryptedData);

    return $decryptedFileName;
}


if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['audio'])) {
    $password = $_POST['passwd'];
    $audio = $_FILES['audio'];
    $type = $_POST['type'];

    if ($type === 'encrypt') {
        $crypt = encrypt1(file_get_contents($audio['tmp_name']), $password);
    } else if ($type === 'decrypt') {
        $crypt = decrypt1(file_get_contents($audio['tmp_name']), $password);
    }

    unlink($audio['tmp_name']);

    log_message("Crypt file path: " . $crypt);

    if ($crypt !== false && !empty($crypt)) {
        header('Content-Type: application/octet-stream');
        header("Content-Transfer-Encoding: Binary"); 
        header("Content-Disposition: attachment; filename=\"" . basename($crypt) . "\""); 
        readfile($crypt);
        unlink($crypt); 
    } else {
        echo "An error occurred during the encryption/decryption process. Please check your password and try again <a href='index.html'>here</a>";
    }
}

?>