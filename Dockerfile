FROM ruby:2.3.1

# prepare
RUN apt-get -y update --fix-missing
RUN apt-get -y install apt-utils
RUN apt-get -y install build-essential wget git cmake nodejs sudo --fix-missing

# install curl
RUN apt-get -y install curl
RUN curl -sL https://deb.nodesource.com/setup_4.x | bash

# install & configure postgres
RUN apt-get -y install postgresql-9.4 postgresql-contrib-9.4 libpq-dev
RUN /bin/bash -lc 'echo "local   all   all     trust" > /etc/postgresql/9.4/main/pg_hba.conf'
RUN service postgresql start && psql -U postgres -c "CREATE ROLE root WITH CREATEDB LOGIN SUPERUSER PASSWORD '';"


# install rmagick
RUN apt-get -y install libmagickcore-dev libmagickwand-dev

# create docker user
RUN useradd -ms /bin/bash docker
RUN echo 'docker ALL=(ALL) NOPASSWD: ALL' >> /etc/sudoers

# node + npm via nvm; install npm packages
WORKDIR /tmp
RUN curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.31.3/install.sh | bash
COPY package.json /tmp/
COPY .nvmrc /tmp/
RUN /bin/bash -c 'source ~/.nvm/nvm.sh;\
    nvm install;\
    nvm use;\
    npm install'

# configure app
ENV BUNDLE_PATH /box
WORKDIR /usr/src/app
COPY . /usr/src/app/
RUN sudo chown -R docker:nogroup /usr/src/app
RUN cp -a /tmp/node_modules /usr/src/app/
RUN cp -a config/database.yml.example config/database.yml
RUN chmod +x run.sh
CMD ./run.sh
