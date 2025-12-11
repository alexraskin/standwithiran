FROM --platform=$BUILDPLATFORM golang:1.25-alpine AS build

WORKDIR /build

COPY go.mod go.sum ./
RUN go mod download

COPY . .

ARG TARGETOS
ARG TARGETARCH

RUN --mount=type=cache,id=s/80d283d0-d9db-497a-b474-c0356c145e8f,target=/root/.cache/go-build \
    --mount=type=cache,id=s/80d283d0-d9db-497a-b474-c0356c145e8f,target=/go/pkg \
    CGO_ENABLED=0 \
    GOOS=$TARGETOS \
    GOARCH=$TARGETARCH \
    go build -o standwithiran github.com/alexraskin/standwithiran

FROM alpine

RUN apk --no-cache add ca-certificates

COPY --from=build /build/standwithiran /bin/standwithiran

EXPOSE 8080

CMD ["/bin/standwithiran"]
