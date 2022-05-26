Steps for deploy a replica set of mongodb:

-- Generate a key file using openSSL
    openssl rand -base64 756 > replicaKeyFile
    chmod 400 replicaKeyFile


-- Set up a mongod.conf like the one in folder with
    option    replication:                          to let mongod know we are setting a replica set with name = "rs0"
                replSetName: "rs0"

    option    security:                             to let mongod read the path "etc/replicaKeyFile" and set
                keyFile: etc/replicaKeyFile         text of it as KeyFile for each node of replica set


-- Create a initiate replica set script like rs-init.sh
    You can choose which node is PRIMARY by setting "priority" with the highest number.
    priority = 0 mean this SECONDARY node can not become PRIMARY. We can use it as Hidden member or Deplayed member for backup and reports
    https://www.mongodb.com/docs/manual/core/replica-set-priority-0-member/


-- Up the yml file using docker-compose:
    docker-compose -f mongo_replica_set.yml up


-- Go to mongo1 bash: docker exec -it <containerID of mongo1> bash
    run the script: /scripts/rs-init.sh
    Wait for a few seconds after init and press Enter, you should see something like "rs0 [direct: primary] admin>"


-- Running:
    mongosh
    use admin
    db.createUser(
        {
            user: 'admin',
            pwd: 'password',
            roles: [ { role: 'root', db: 'admin' } ]
        }
    );
    db.auth('admin','password')
    rs.status()
    