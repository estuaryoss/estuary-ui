## Estuary UI

Service that provides a UI interface to connect, control & collect information from the Estuary Stack:

- registered Eureka Apps
- active & finished commands running on the Agents
- file transfers on the Agents
- run commands across the Stack

![image](https://user-images.githubusercontent.com/43060213/146963197-2fa89b91-ba1e-44c8-a36c-00a2015a831e.png)

## Docker Hub

[ui](https://hub.docker.com/r/estuaryoss/ui) ![](https://img.shields.io/docker/pulls/estuaryoss/ui.svg)

## Build

[![Build Status](https://travis-ci.org/estuaryoss/estuary-ui.svg?branch=master)](https://travis-ci.org/estuaryoss/estuary-ui)

## Docker run

Default token is 'None' for no HTTP auth

```shell script
docker run -p 8080:8080 -e SERVICE_BACKEND_URL=http(s)://estuary_discovery_ip:estuary_discovery_port -e SERVICE_USERNAME=username -e SERVICE_PASSWORD=changeIt estuaryoss/ui:latest
```

E.g.:

```shell script
docker run -p 8080:8080 -e SERVICE_BACKEND_URL=http://192.168.100.8:8080 -e SERVICE_USERNAME=username -e SERVICE_PASSWORD=changeIt estuaryoss/ui:latest
```

## Docker run - aggregating multiple discovery(ies)

UI supports aggregating multiples discovery services. List the discovery services separated by a comma.

```shell script
docker run -p 8080:8080 -e SERVICE_BACKEND_URL=http://192.168.100.8:8080,http://192.168.100.9:8080 -e SERVICE_USERNAME=username -e SERVICE_PASSWORD=changeIt estuaryoss/ui:latest
```

## Estuary stack

[Estuary agent](https://github.com/estuaryoss/estuary-agent)  
[Estuary discovery](https://github.com/estuaryoss/estuary-discovery)  
[Estuary UI](https://github.com/estuaryoss/estuary-ui)  

## Learning resources

https://medium.com/js-dojo/component-communication-in-vue-js-ca8b591d7efa  
https://www.telerik.com/blogs/in-vue-when-do-i-actually-need-the-key-attribute-and-why  
https://quasar.dev/  
https://applitools.com/blog/page-objects-app-actions-cypress/  
https://www.cypress.io/blog/2019/01/03/stop-using-page-objects-and-start-using-app-actions/#just-functions  

Support
project: <a href="https://paypal.me/catalindinuta?locale.x=en_US"><img src="https://lh3.googleusercontent.com/Y2_nyEd0zJftXnlhQrWoweEvAy4RzbpDah_65JGQDKo9zCcBxHVpajYgXWFZcXdKS_o=s180-rw" height="40" width="40" align="center"></a>
