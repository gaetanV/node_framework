interface FsInterface {
    readFileSync(path: string): void;
    readFileSync(path: string, format: string): string;
}
