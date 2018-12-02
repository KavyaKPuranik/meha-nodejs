#!/bin/bash


FOLDER=`echo $PWD`


start() 
{
  stat=$(status)
  if [ "$stat" = "false" ]
  then
	cd $FOLDER
	npm install >> ./logs/service.log 2>&1 &
	node meha/src/main/server.js >> ./logs/service.log 2>&1 &
	RUNNING_PID=$!
	echo "Meha is runnig on pid: $RUNNING_PID"
	echo "$RUNNING_PID" > "./meha.pid"
  else
	echo "Meha is already runnig on pid: $stat"
  fi
}


status() 
{
  file="./meha.pid"
  if [ ! -f $file ] 
  then
    echo "false";
  else
    RUNNING_PID=`cat "./meha.pid"`
    if [ -e /proc/${RUNNING_PID} -a /proc/${RUNNING_PID}/exe ]
    then
      echo "${RUNNING_PID}";
    else
      echo "false";
    fi
  fi
}

stop() 
{
  stat=$(status)
  if [ "$stat" = "false" ]
  then
    echo "Meha is NOT running"

  else
    kill -9 $stat
    sleep 2
    if [ -e /proc/${stat} -a /proc/${stat}/exe ]
    then
      echo "Unable to stop the service. Meha is still runnig on pid: $stat"
    else
      echo "Successfully stopped Meha"
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
