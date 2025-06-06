class Response<T> {
    status: string;
    length: number;
    data: T;

    constructor(status: string, data: T) {
        this.status = status;
        this.length = data ? (Array.isArray(data) ? data.length : 0) : 0;
        this.data = data;
    }
}

export default Response;
