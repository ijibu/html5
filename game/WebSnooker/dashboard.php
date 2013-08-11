<?php
if ($_GET['info'] == 'true') {
	/*
    $ret = array(
        "nicks" => array("5204505f34f714.00821883" => array("nick" => "ijibu","playing" => true)),
        "invited" => false
    );
	*/
	//用户收到了游戏邀请
	$ret = array(
        "nicks" => array("5204505f34f714.00821883" => array("nick" => "ijibu","playing" => true)),
        "invited" => array(
			"nick" => "ijibu22",
			"data" => array(
				"server" => '81ee91',
				"gamemode" => "snooker",
				"shottime" => "0",
				"password" => 0,
				"frames" => "1",
				"host_lang" => "zh",
                "client_lang" => null
			),
		),
    );
} else {
    $ret = array("status" => ok); 
}

echo json_encode($ret);exit;