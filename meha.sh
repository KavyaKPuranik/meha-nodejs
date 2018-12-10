#!/bin/bash


FOLDER='~/meha-nodejs-master'


start() 
{
  stat=$(status)
  if [ "$stat" = "false" ]
  then
	cd $FOLDER
	sudo npm install >> $FOLDER/logs/service.log 2>&1 &
	sudo node meha/src/main/server.js >> $FOLDER/logs/service.log 2>&1 &
	RUNNING_PID=$!
	echo "Meha is runnig on pid: $RUNNING_PID"
	echo "$RUNNING_PID" > "./meha.pid"
  else
	echo "Meha is already runnig on pid: $stat"
  fi
}


status() 
{
  stat=$(sudo ps ax | grep -v grep | grep 'node meha/src/main/server.js')
  
  if [ $? -ne 0 ]
  then
    echo 'false'
  else
    pids=`sudo ps ax | grep -v grep | grep 'node meha/src/main/server.js' | cut -d' ' -f2`
    echo $pids
  fi
}

stop() 
{
  stat=$(status)
  if [ "$stat" = "false" ]
  then
    echo "Meha is NOT running"

  else
    sudo kill -9 $stat
    sleep 2
    stat=$(status)
    if [ "$stat" = "false" ]
    then
      echo "Successfully stopped Meha"
    else
      echo "Unable to stop the service. Meha is still runnig on pid: $stat"
    fi
  fi
}

#Body main
case "$1" in
  start)
    start
    ;;
  stop)
    stop
    ;;
  status)
    stat=$(status)
    if [ "$stat" = "false" ]
    then
      echo "Meha is not running"
    else
      echo "Meha is running on $stat"
    fi
    ;;
  restart)
    echo "Restarting Meha..."
    echo " "
    stop
    sleep 2
    start
    ;;
  *)
    echo $"Usage: $0 {start|stop|restart|status}"
    exit 1
esac
exit 0
