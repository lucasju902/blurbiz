#!/bin/bash

cnt=`aws ec2 describe-instances --filters "Name=tag:Name,Values=$1" | grep $1 | wc -l`
if (( $cnt > 0 ))
then
        echo "instance already exists with such a Name tag: $1"
        exit 1
fi

id=`aws ec2 run-instances --image-id ami-d732f0b7 --count 1 --instance-type t2.micro --key-name render_automatic --security-group-ids sg-abfcf8cd --query 'Instances[0].InstanceId'`
if (( $? != 0 ))
then
        echo "failed to create instance"
        exit 1
fi
id="${id%\"}"
id="${id#\"}"

ip=`aws ec2 describe-instances --instance-ids $id --query 'Reservations[0].Instances[0].PublicIpAddress'`
if (( $? != 0 ))
then
        echo "failed to retrieve IP of instance $id, error"
        exit 1
fi
ip="${ip%\"}"
ip="${ip#\"}"

echo "created an instance $id with public IP address $ip"

aws ec2 create-tags --resources $id --tags Key=Name,Value=$1

if (( $? != 0 ))
then
        echo "failed to alter tag, error $err"
        exit 1
fi

echo "assigned name $1 to instance $id"

while [ "$status" != "running" ]; do
        status==`aws ec2 describe-instances --instance-ids $id --query 'Reservations[0].Instances[0].State.Name' 2>&1`
        status=`echo $status | sed -e 's/=//g' | sed -e 's/^"//' -e 's/"$//'`
        echo "state : $status"
        sleep 3s
done

echo "finished spinup"

pem="key.pem"
login="ubuntu"
server=$ip

while ! nc -w 3 -z $ip 22; do
  sleep 3s
  echo "so far SSH not available"
done

echo -e "Try to connect to server first\n"

chmod 600 $pem

function getfullpath {
        oldpath=`pwd`
        cd `dirname $1`
        local res=`pwd`
        cd $oldpath
        file_name=`basename $1`
        res="$res/$file_name"
        local __resultvar=$2
        eval $__resultvar=$res
}

getfullpath $pem absolute_pem

function invoke {
        ssh_command="ssh  -o StrictHostKeyChecking=no -o BatchMode=yes -o ConnectTimeout=50 -i $absolute_pem -l $login $server $1 2>&1"
        echo -e "$ssh_command\n"

        status=$($ssh_command)
        retcode=$?

        if [[ $retcode == 0 ]] ; then
                echo "OK"
        elif [[ $status == "Permission denied"* ]] ; then
                echo -e "Login failed\n"
                exit 1
        else
                echo -e "Connection or command failed: $status, retcode $retcode \n"
                if [[ $2 == 1 ]] ; then
			echo -e "Failed but not exiting as second param set to 1"
			return 1
		else
			exit 1
		fi
        fi
}

function upload {
        getfullpath $1 upload_path
        ssh_command="scp -o StrictHostKeyChecking=no -o BatchMode=yes -o ConnectTimeout=5 -i $absolute_pem $upload_path $login@$server:$2"
        echo -e "$ssh_command";

        status=$($ssh_command)

        if [[ $status == `` ]] ; then
                echo "OK"
        elif [[ $status == "Permission denied"* ]] ; then
                echo -e "Login failed\n"
                exit 1
        else
                echo -e "Connection failed: $status\n"
                exit 1
        fi
}

invoke echo ok

if [ -z "${branch+xxx}" ]; then branch=`git rev-parse --abbrev-ref HEAD` ; fi

echo "branch is $branch"

invoke "sudo apt-get update"
invoke "sudo apt-get upgrade -y"
invoke "sudo apt-get install -y software-properties-common"
invoke "sudo apt-get install -y wget"
invoke "sudo apt-get install -y curl"
invoke "sudo add-apt-repository ppa:git-core/ppa && sudo apt-get update && sudo apt-get install -y git"
invoke "export LC_ALL=C.UTF-8"
invoke "sudo apt-get remove --purge nodejs npm"
invoke "sudo curl -sL https://deb.nodesource.com/setup_4.x | sudo -E bash -"
invoke "sudo apt-get install -y nodejs"
invoke "git config --global user.email 'aoshmyanskaya@gmail.com'"
invoke "git config --global user.name 'Alexandra Oshmyanskaya'"
invoke "curl -sL https://deb.nodesource.com/setup | sudo bash -"
invoke "sudo npm install -g bower"
upload ./id_rsa /home/ubuntu/.ssh/id_rsa
upload ./id_rsa.pub /home/ubuntu/.ssh/id_rsa.pub
invoke "sudo chmod 600 /home/ubuntu/.ssh/id_rsa"
invoke "sudo chmod 644 /home/ubuntu/.ssh/id_rsa.pub"
invoke "sudo chown ubuntu /home/ubuntu/.ssh/id_rsa"
invoke "sudo chgrp nogroup /home/ubuntu/.ssh/id_rsa"
invoke "sudo chown ubuntu /home/ubuntu/.ssh/id_rsa.pub"
invoke "sudo chgrp nogroup /home/ubuntu/.ssh/id_rsa.pub"
invoke "ssh-keyscan github.com >>/home/ubuntu/.ssh/known_hosts"
invoke "cd /home/ubuntu && git clone -b $branch --single-branch git@github.com:TimurDaudpota/bb" 

