
#include <node.h>

int index = 0;

struct collectOr {
    int *value;
    int cmp = 0;
};

char * tab[100]  = {};
struct collectOr tabL[100]  = {};

namespace nodeFramework {

  using v8::FunctionCallbackInfo;
  using v8::Isolate;
  using v8::Local;
  using v8::Object;
  using v8::String;
  using v8::Value;

  char* ToCString(Local<String> str) {
    String::Utf8Value value(str);
    return *value;
  }

  void Route(const FunctionCallbackInfo<Value>& args) {

    char* param1 = ToCString(args[0]->ToString());
    int size = strlen(param1);
    free(tab[index]);
    if(!tabL[size].value) {
      tabL[size].value = (int*) malloc( 15 * sizeof (int));
    }
    tabL[size].value[tabL[size].cmp] = index;
    tabL[size].cmp ++;

    tab[index] =(char*) malloc( strlen(param1) * sizeof (char));
    strcpy(tab[index],param1);
    index++;
    args.GetReturnValue().Set(0);
    
  }

  void Match(const FunctionCallbackInfo<Value>& args) {

    char* param1 = ToCString(args[0]->ToString());

    if(tabL[strlen(param1)].cmp > 0){
      for(int i = 0 ; i < tabL[strlen(param1)].cmp ; i++){
            if(strcmp(tab[tabL[strlen(param1)].value[i]], param1) == 0){
              args.GetReturnValue().Set(tabL[strlen(param1)].value[i]+1);
              return;
            } 
        }
    }
    args.GetReturnValue().Set(0);

  }

  void init(Local<Object> exports) {
    NODE_SET_METHOD(exports, "match", Match);
    NODE_SET_METHOD(exports, "route", Route);
  }

  NODE_MODULE(NODE_GYP_MODULE_NAME, init)

}  