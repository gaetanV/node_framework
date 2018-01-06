
#include <node.h>
#include "lib/tools.cc"
#include "lib/param-route.cc"
#include "lib/route.cc"

namespace OldNodeFramework {

    using v8::FunctionCallbackInfo;
    using v8::Isolate;
    using v8::Local;
    using v8::Object;
    using v8::String;
    using v8::Value;
    using Tools::ToCString;

    void RouteParam(const FunctionCallbackInfo<Value>& args) {
        char* param1 = ToCString(args[0]->ToString());
        ParamRoute::Route(param1);
        args.GetReturnValue().Set(0);
    }


    void Route(const FunctionCallbackInfo<Value>& args) {
        char* param1 = ToCString(args[0]->ToString());
        Route::Route(param1);
        args.GetReturnValue().Set(0);
    }

    void Match(const FunctionCallbackInfo<Value>& args) {

        char* param1 = ToCString(args[0]->ToString());
        int size = strlen(param1);
        
        int route = Route::Match(param1,size);
        if(route!= 0){
            args.GetReturnValue().Set(route);
            return;    
        }else{
            args.GetReturnValue().Set(ParamRoute::Match(param1,size));
        }   

    }

    void init(Local<Object> exports) {
        NODE_SET_METHOD(exports, "match", Match);
        NODE_SET_METHOD(exports, "route", Route);
        NODE_SET_METHOD(exports, "routeParam", RouteParam);
    }

    NODE_MODULE(NODE_GYP_MODULE_NAME, init)

}  