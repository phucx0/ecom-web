export class CouchDbError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: string,
  ) {
    super(message);
    this.name = "CouchDbError";
  }
}

export class CouchDbConflictError extends CouchDbError {
  constructor(message = "Document đã được cập nhật bởi một yêu cầu khác.") {
    super(message, 409, "COUCHDB_CONFLICT");
    this.name = "CouchDbConflictError";
  }
}
