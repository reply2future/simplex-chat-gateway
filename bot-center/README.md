# Working flow

1. service start and check if created a group named `Notification#${user_id}`, if not, then create one and print the `group_id` in the console.
2. service start a web server to listen on port 6794 if you don't set the environment `SERVER_PORT`

## API

1. health check
2. inviate user to join a group
3. send a message to the group.