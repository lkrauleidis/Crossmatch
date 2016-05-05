
#import <Foundation/Foundation.h>
#import "RCTBridgeModule.h"
#import "RCTEventDispatcher.h"
#import <Firebase/Firebase.h>

@interface FirebaseManager: NSObject <RCTBridgeModule>
{

}

@property(nonatomic, strong) Firebase* firebaseRef;

@end
