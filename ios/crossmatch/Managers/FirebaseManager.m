
#import "FirebaseManager.h"

#define BASE_URL @"https://blinding-fire-5597.firebaseio.com"

@implementation FirebaseManager

@synthesize bridge = _bridge;

RCT_EXPORT_MODULE();

- (id) init
{
    if (self = [super init])
    {
      _firebaseRef = [[Firebase alloc] initWithUrl:BASE_URL];
    }
    return self;
}

RCT_EXPORT_METHOD(setFirebaseVal: (NSDictionary *)dataMap
                  callback: (RCTResponseSenderBlock)callback)
{

  NSMutableDictionary* dicData = [NSMutableDictionary dictionaryWithDictionary:dataMap];
  dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
    [self asyncSetFirebaseVal:callback dictionaryData: dicData];
  });
}

-(void) asyncSetFirebaseVal: (RCTResponseSenderBlock)callback dictionaryData: (NSMutableDictionary *)dicData{
  if (dicData.count != 0) {
    NSString* firstKey = [[dicData allKeys] objectAtIndex:0];
    NSDictionary* firstValue = dicData[firstKey];
    
    Firebase* child = [_firebaseRef childByAppendingPath:firstKey];
    [child setValue:firstValue withCompletionBlock:^(NSError *error, Firebase *ref) {
      
      [dicData removeObjectForKey:firstKey];
      
      if(dicData.count != 0){
        [self asyncSetFirebaseVal:callback dictionaryData:dicData];
      }
      else{
        if (error) {
          callback(@[@NO]);
        }
        else{
          callback(@[@YES]);
        }
      }
    }];
  }
}

RCT_EXPORT_METHOD(removeFirebaseVal: (NSDictionary *)dataMap
                  callback: (RCTResponseSenderBlock)callback)
{
  
  NSMutableDictionary* dicData = [NSMutableDictionary dictionaryWithDictionary:dataMap];
  dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
    [self asyncRemoveFirebaseVal:callback dictionaryData: dicData];
  });
}

-(void) asyncRemoveFirebaseVal: (RCTResponseSenderBlock)callback dictionaryData: (NSMutableDictionary *)dicData{
  if (dicData.count != 0) {
    NSString* firstKey = [[dicData allKeys] objectAtIndex:0];
    
    Firebase* child = [_firebaseRef childByAppendingPath:firstKey];
    [child removeValueWithCompletionBlock:^(NSError *error, Firebase *ref) {
      
      [dicData removeObjectForKey:firstKey];
      
      if(dicData.count != 0){
        [self asyncRemoveFirebaseVal:callback dictionaryData:dicData];
      }
      else{
        if (error) {
          callback(@[@NO]);
        }
        else{
          callback(@[@YES]);
        }
      }
    }];
  }
}



@end
