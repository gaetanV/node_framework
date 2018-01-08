#include <node.h>
#include "lib/tools.cc"
#include "lib/route.cc"

namespace nodeFramework {

  using v8::FunctionCallbackInfo;
  using v8::Isolate;
  using v8::Local;
  using v8::Object;
  using v8::String;
  using v8::Value;
  using Tools::ToCString;

  void Route(const FunctionCallbackInfo<Value>& args) {
    char* param1 = ToCString(args[0]->ToString());
    Route::Route(param1);
    args.GetReturnValue().Set(0);
  }

 void Match(const FunctionCallbackInfo<Value>& args) {
    char* param1 = ToCString(args[0]->ToString());
    args.GetReturnValue().Set(Route::Match(param1));
  }

  void FastMatch(const FunctionCallbackInfo<Value>& args) {
    char* param1 = ToCString(args[0]->ToString());
    int size = strlen(param1);
    args.GetReturnValue().Set(Route::FastMatch(param1,size));
  }

  void init(Local<Object> exports) {
    NODE_SET_METHOD(exports, "fastMatch", FastMatch);
    NODE_SET_METHOD(exports, "match", Match);
    NODE_SET_METHOD(exports, "route", Route);

  }

  NODE_MODULE(NODE_GYP_MODULE_NAME, init)

}  