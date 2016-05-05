package com.crossmatch.FirebaseManager;

import com.crossmatch.MainActivity;
import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.JavaScriptModule;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Created by IncredibleMan on 2/12/16.
 */
public class FirebasePackage implements ReactPackage {

    private MainActivity mainActivity;

    public  FirebasePackage(MainActivity mainActivity){
        this.mainActivity = mainActivity;
    }

    @Override
    public List<NativeModule> createNativeModules(ReactApplicationContext reactContext) {
        List<NativeModule> modules = new ArrayList<>();

        modules.add(new FirebaseManager(reactContext, mainActivity));

        return modules;
    }

    @Override
    public List<Class<? extends JavaScriptModule>> createJSModules() {
        return Collections.emptyList();
    }

    @Override
    public List<ViewManager> createViewManagers(ReactApplicationContext reactContext) {
        return Collections.emptyList();
    }
}
