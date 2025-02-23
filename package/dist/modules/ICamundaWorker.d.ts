export default interface ICamundaWorker {
    registerTask(taskType: string, handler: (variables: Record<string, any>, params: any) => Promise<Record<string, any>>, paramNames?: string[]): void;
}
