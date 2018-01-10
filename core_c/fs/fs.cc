#include <node.h>
#include <thread>
#include <chrono>
#include <stdlib.h>
#include <uv.h> 
#include <vector>

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


    struct Work {
        uv_work_t request;
        Persistent<Function> callback;
    };

    void TaskOpenFile(uv_work_t *req){}

    void CallOpenFile(uv_work_t* req, int status) {
        
        Isolate * isolate = Isolate::GetCurrent();
        v8::HandleScope handleScope(isolate);
        Work *work = static_cast<Work *>(req->data);
  
        Local<Value> argv[1];
        argv[0] = { String::NewFromUtf8(isolate, "Welcome worker") };
        Local<Function>::New(isolate, work->callback)->Call(isolate->GetCurrentContext()->Global(), 1, argv);
        delete work;
    }


    void Open(const FunctionCallbackInfo<Value>& args) {

        Work * work = new Work();
        work->request.data = work;
        work->callback.Reset(
            args.GetIsolate(), 
            Local<Function>::Cast(args[0])
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