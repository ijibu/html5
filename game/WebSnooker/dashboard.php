<?php
if ($_GET['info'] == 'true') {
    $ret = array(
        "nicks" => array("5204505f34f714.00821883" => array("nick" => "ijibu","playing" => true)),
        "invited" => false
    );
} else {
    $ret = array("status" => ok); 
}

echo json_encode($ret);exit;