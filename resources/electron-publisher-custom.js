const {
  getCiTag,
  HttpPublisher,
  PublishContext,
  PublishOptions
} = require("electron-publish/out/publisher");
const { httpExecutor } = require("builder-util/out/nodeHttpExecutor");
const mime = require("mime");
const { configureRequestOptions } = require("builder-util-runtime");

class Publisher extends HttpPublisher {
  async doUpload(fileName, arch, dataLength, requestProcessor, file) {
    return await httpExecutor.doApiRequest(
      configureRequestOptions({
        hostname: "my.host.name", // TODO: from configuration
        protocol: "http:", // TODO: from configuration
        port: 8888, // TODO: from configuration
        path: "/some/path", // TODO: from configuration mixed with file meta about name/os/channel etc
        method: "POST",
        headers: {
          "X-File-Name": fileName,
          "Content-Type": mime.getType(fileName) || "application/octet-stream",
          "Content-Length": dataLength
        }
      }),
      this.context.cancellationToken,
      requestProcessor
    );
  }
}

module.exports = {
  default: Publisher
};
