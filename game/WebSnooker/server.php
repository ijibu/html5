<?php
//$ret = array("status" => 1, "received" => 1, "sent" => 1);
if ($_GET['query'] == 'server' || $_GET['query'] == 'servers') {
    // $ret = array(
    //    "count" => array("players" => 0,"servers" => 0),
    //    "servers" => array()
    // );

    $ret = array(
       "count" => array("players" => 1,"servers" => 1),
       "servers" => array(
            array(
                "server_id" => "81ee90","server_name" => "room1","host_player" => "hui","client_player" => null,
                "gamemode" => "snooker","shottime" => "0","password" => 0,"frames" => "1","host_lang" => "zh",
                "client_lang" => null),
        )
    );

} else if ($_GET['query'] == 'host'){
    $ret = array(
      "server" => array(
            "id" => "324421-2c09bf-3c4bdd"
        )
    );
} else if($_GET['query'] == 'join') {       //加入游戏，js端由network.ajax("join"  触发。
    $ret = array(
      "server" => array(
            "id" => "324421-2c09bf-3c4bdd"
        )
    );
} else {
    $ret = array(
        "status" => 1, "received" => 1, "sent" => 1, "ack" => "1375954421",
        'packets' => array(
            0 => array(
                "time" => "1375954421",
                'data' => array(
                    "event" => "shoot",
                    "x" => "0.5622127497947318",
                    "y" => "-0.15236583786410068",
                    "player" => "52685f",
                    "hash" => "3aab71d78143afd37916930094901368",
                )
            )
        ),
        'servers' => array()
    );
}

echo json_encode($ret);exit;

/**
 * 双人游戏。
 * {"status":1,"received":1,"ack":"1375954421","packets":[{"time":"1375954421","data":{"event":"shoot","x":"0.5622127497947318","y":"-0.15236583786410068","player":"52685f","hash":"3aab71d78143afd37916930094901368"}}]}
 */

/**
 * server.php?query=server
        {"count":{"players":0,"servers":0},"servers":[]}
 */

/**
 * dashboard.php?_=1376029719612&info=true
        {"nicks":{"5204505f34f714.00821883":{"nick":"ijibu","playing":false}},"invited":false}
 */


/**
 * server.php?_=1376031488367&query=host&server_name=Snooker+room&name=ijibu&gamemode=snooker&shottime=0&password=&lang=en-us&frames=1
        {"server":{"id":"324421-2c09bf-3c4bdd"}}
 */