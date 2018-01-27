#include <node.h>
#include <thread>
#include <chrono>
#include <stdlib.h>
#include <uv.h> 
#include <vector>

#include "../lib/tools.cc"

namespace nodeFs {

    using v8::Function;

    using v8::FunctionCallbackInfo;
    using v8::Isolate;
    using v8::Local;
    using v8::Object;
    using v8::String;
    using v8::Value;
    using v8::Null;
    using v8::Number;
    using v8::Persistent;

    using Tools::ToCString;

    struct Work {
        uv_work_t request;
        Persistent<Function> callback;
        char *path;
        char *response;
    };

    void TaskOpenFile(uv_work_t *req){

        Work *work = static_cast<Work *>(req->data);

        FILE *fp = fopen(work->path, "r");
        fseek(fp, 0, SEEK_END);
        int size = ftell(fp);
        fseek(fp, 0, SEEK_SET); 

        work->response = (char*) malloc( size * sizeof (char));
        fread (work->response, 1, size, fp);

        fclose(fp);

    }

    void CallOpenFile(uv_work_t* req, int status) {

        Isolate * isolate = Isolate::GetCurrent();
        v8::HandleScope handleScope(isolate);
        Work *work = static_cast<Work *>(req->data);
    
        Local<Value> argv[1];
        argv[0] = { String::NewFromUtf8(isolate, work->response) };
        Local<Function>::New(isolate, work->callback)->Call(isolate->GetCurrentContext()->Global(), 1, argv);
        delete work;

    }


    void Open(const FunctionCallbackInfo<Value>& args) {

        Work * work = new Work();

        char* param1 = ToCString(args[0]->ToString());
        work->path = (char*) malloc( strlen(param1) * sizeof (char));
        work->path = param1;
        work->request.data = work;
        work->callback.Reset(
            args.GetIsolate(), 
            Local<Function>::Cast(args[1])
        );

        uv_queue_work(
            uv_default_loop(),
            &work->request,
            TaskOpenFile,
            CallOpenFile
        );
      
    }

    void init(Local<Object> exports) {
        NODE_SET_METHOD(exports, "open", Open);
    }

    NODE_MODULE(NODE_GYP_MODULE_NAME, init)

}  