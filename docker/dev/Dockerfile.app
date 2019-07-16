# Gives us Node, Yarn, Linux
FROM mhart/alpine-node:12.6

ENV NODE_ENV development

# Update & install required packages
RUN apk add --update bash python git curl make g++ postgresql-client

#### BEGIN some very specific Go setup

# set up nsswitch.conf for Go's "netgo" implementation
# - https://github.com/golang/go/blob/go1.9.1/src/net/conf.go#L194-L275
# - docker run --rm debian:stretch grep '^hosts:' /etc/nsswitch.conf
RUN [ ! -e /etc/nsswitch.conf ] && echo 'hosts: files dns' > /etc/nsswitch.conf

ENV GOLANG_VERSION 1.10.4

RUN set -eux; \
	apk add --no-cache --virtual .build-deps \
		bash \
		gcc \
		musl-dev \
		openssl \
		go \
	; \
	export \
# set GOROOT_BOOTSTRAP such that we can actually build Go
		GOROOT_BOOTSTRAP="$(go env GOROOT)" \
# ... and set "cross-building" related vars to the installed system's values so that we create a build targeting the proper arch
# (for example, if our build host is GOARCH=amd64, but our build env/image is GOARCH=386, our build needs GOARCH=386)
		GOOS="$(go env GOOS)" \
		GOARCH="$(go env GOARCH)" \
		GOHOSTOS="$(go env GOHOSTOS)" \
		GOHOSTARCH="$(go env GOHOSTARCH)" \
	; \
# also explicitly set GO386 and GOARM if appropriate
# https://github.com/docker-library/golang/issues/184
	apkArch="$(apk --print-arch)"; \
	case "$apkArch" in \
		armhf) export GOARM='6' ;; \
		x86) export GO386='387' ;; \
	esac; \
	\
	wget -O go.tgz "https://golang.org/dl/go$GOLANG_VERSION.src.tar.gz"; \
	echo '6fe44965ed453cd968a81988523e9b0e794d3a478f91fd7983c28763d52d5781 *go.tgz' | sha256sum -c -; \
	tar -C /usr/local -xzf go.tgz; \
	rm go.tgz; \
	\
	cd /usr/local/go/src; \
	./make.bash; \
	\
	rm -rf \
# https://github.com/golang/go/blob/0b30cf534a03618162d3015c8705dd2231e34703/src/cmd/dist/buildtool.go#L121-L125
		/usr/local/go/pkg/bootstrap \
# https://golang.org/cl/82095
# https://github.com/golang/build/blob/e3fe1605c30f6a3fd136b561569933312ede8782/cmd/release/releaselet.go#L56
		/usr/local/go/pkg/obj \
	; \
	apk del .build-deps; \
	\
	export PATH="/usr/local/go/bin:$PATH"; \
	go version

ENV GOPATH /go
ENV PATH $GOPATH/bin:/usr/local/go/bin:$PATH

RUN mkdir -p "$GOPATH/src" "$GOPATH/bin" && chmod -R 777 "$GOPATH"

#### END very specific Go setup

RUN mkdir -p "$GOPATH/src" "$GOPATH/bin" && chmod -R 777 "$GOPATH"

RUN go get github.com/elwinar/rambler
RUN cd "$GOPATH/src/github.com/elwinar/rambler" && go install

# Add container group and container user
RUN addgroup -S container && adduser -S -G container container

USER root
RUN apk -v --update add \
        python \
        py-pip \
        groff \
        less \
        mailcap \
        && \
    pip install --upgrade pip \
        && \
    pip install --upgrade awscli s3cmd python-magic \
        && \
    apk -v --purge del py-pip \
        && \
    rm /var/cache/apk/*

# Install app dependencies
# Only copy in files needed by `yarn install` so that changes in other sources
# (the more common case) do not invalidate the docker cache. The `yarn install`
# is the slowest part of building the image.
USER root
RUN mkdir /container && chown container /container/
COPY --chown=container package.json /container/
COPY --chown=container yarn.lock /container/
WORKDIR /container
RUN yarn install

# Set work directory to /container
USER container
WORKDIR /container

# Copy in remaining files
COPY --chown=container . /container/

USER root
WORKDIR /container
RUN npm rebuild bcrypt --build-from-source
RUN chown -R container:container /container/

#
# Run the app
#

USER container

# set your port
ENV PORT 3005

# Scripts for Postgres setup
RUN chmod +x /container/docker/wait-for-postgres.sh
RUN chmod +x /container/docker/dev/entrypoint.sh

ENTRYPOINT ["/bin/bash", "-x", "/container/docker/wait-for-postgres.sh", "postgres", "db", "5432", "/container/docker/dev/entrypoint.sh"]
