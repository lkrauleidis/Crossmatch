package com.crossmatch.FirebaseManager;

import android.content.Context;
import android.os.AsyncTask;
import android.util.Log;

import com.crossmatch.Constants;
import com.crossmatch.MainActivity;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableNativeArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.type.MapType;
import com.fasterxml.jackson.databind.type.TypeFactory;
import com.firebase.client.DataSnapshot;
import com.firebase.client.Firebase;
import com.firebase.client.FirebaseError;
import com.firebase.client.MutableData;
import com.firebase.client.Transaction;
import com.firebase.client.ValueEventListener;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;
import java.io.StringReader;
import java.lang.reflect.Array;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.annotation.Nullable;


/**
 * Created by IncredibleMan on 2/12/16.
 */
public class FirebaseManager extends ReactContextBaseJavaModule {

    private MainActivity mainActivity;
    private ReactContext context;

    public FirebaseManager(ReactApplicationContext reactContext, MainActivity mainActivity){
        super(reactContext);

        context = reactContext;
        this.mainActivity = mainActivity;
    }

    @Override
    public String getName() {
        return "FirebaseManager";
    }

    @ReactMethod
    public void setFirebaseVal(ReadableMap data, Callback callback){
        new asyncSetFirebaseVal(data, callback).execute();
    }

    @ReactMethod
    public void removeFirebaseVal(ReadableMap data, Callback callback){
        new asyncRemoveFirebaseVal(data, callback).execute();
    }

    public Map<String, Object> convertToHashMap(ReadableMap data) {

        Map<String, Object> map = new HashMap<String, Object>();

        JSONObject jsonObject = null;
        try {
            jsonObject = new JSONObject(data.toString());
            jsonObject = jsonObject.getJSONObject("NativeMap");

            map = jsonToMap(jsonObject);

        } catch (JSONException e) {
            e.printStackTrace();
        }

        return map;
    }

    public Map<String, Object> jsonToMap(JSONObject json) throws JSONException {
        Map<String, Object> retMap = new HashMap<String, Object>();

        if(json != JSONObject.NULL) {
            retMap = toMap(json);
        }
        return retMap;
    }

    public Map<String, Object> toMap(JSONObject object) throws JSONException {
        Map<String, Object> map = new HashMap<String, Object>();

        Iterator<String> keysItr = object.keys();
        while(keysItr.hasNext()) {
            String key = keysItr.next();
            Object value = object.get(key);

            if(value instanceof JSONArray) {
                value = toList((JSONArray) value);
            }

            else if(value instanceof JSONObject) {
                value = toMap((JSONObject) value);
            }
            map.put(key, value);
        }
        return map;
    }

    public List<Object> toList(JSONArray array) throws JSONException {
        List<Object> list = new ArrayList<Object>();
        for(int i = 0; i < array.length(); i++) {
            Object value = array.get(i);
            if(value instanceof JSONArray) {
                value = toList((JSONArray) value);
            }

            else if(value instanceof JSONObject) {
                value = toMap((JSONObject) value);
            }
            list.add(value);
        }
        return list;
    }

    private class asyncSetFirebaseVal extends AsyncTask<String, Void, String> {

        ReadableMap data;
        Callback callback;

        public asyncSetFirebaseVal(ReadableMap data, Callback callback){
            this.data = data;
            this.callback = callback;
        }

        @Override
        protected String doInBackground(String... params) {

            try{
                final HashMap<String, Object> map = (HashMap<String, Object>) convertToHashMap(data);
                Set<Map.Entry<String,Object>> mapEntrySet = map.entrySet();
                setFirebaseVal(mapEntrySet);
            }
            catch (Exception e){
                Log.e("FirebaseError", e.getMessage());
                callback.invoke(false);
            }

            return null;
        }

        private void setFirebaseVal(final Set<Map.Entry<String,Object>> mapEntrySet){
            if(!mapEntrySet.isEmpty()) {
                final Map.Entry<String, Object> mapEntry = mapEntrySet.iterator().next();
                String childUrl = mapEntry.getKey();
                Object value = mapEntry.getValue();

                Log.e("FirebaseTestKey", childUrl);
                Log.e("FirebaseTestValue", String.valueOf(value));

                mainActivity.getFirebaseRef()
                        .child(childUrl)
                        .setValue(value, new Firebase.CompletionListener() {
                            @Override
                            public void onComplete(FirebaseError firebaseError, Firebase firebase) {
                                mapEntrySet.remove(mapEntry);

                                if (mapEntrySet.iterator().hasNext()) {
                                    setFirebaseVal(mapEntrySet);
                                }
                                else{
                                    if(firebaseError != null) {
                                        callback.invoke(false);
                                    }
                                    else{
                                        callback.invoke(true);
                                    }
                                }
                            }
                        });
            }
        }
    }

    private class asyncRemoveFirebaseVal extends AsyncTask<String, Void, String> {

        ReadableMap data;
        Callback callback;

        public asyncRemoveFirebaseVal(ReadableMap data, Callback callback){
            this.data = data;
            this.callback = callback;
        }

        @Override
        protected String doInBackground(String... params) {

            try{
                final HashMap<String, Object> map = (HashMap<String, Object>) convertToHashMap(data);
                Set<Map.Entry<String,Object>> mapEntrySet = map.entrySet();
                removeFirebaseVal(mapEntrySet);
            }
            catch (Exception e){
                Log.e("FirebaseError", e.getMessage());
                callback.invoke(false);
            }

            return null;
        }

        private void removeFirebaseVal(final Set<Map.Entry<String,Object>> mapEntrySet){
            if(!mapEntrySet.isEmpty()) {
                final Map.Entry<String, Object> mapEntry = mapEntrySet.iterator().next();
                String childUrl = mapEntry.getKey();
                Object value = mapEntry.getValue();

                Log.e("FirebaseTestKey", childUrl);
                Log.e("FirebaseTestValue", String.valueOf(value));

                mainActivity.getFirebaseRef()
                        .child(childUrl)
                        .removeValue(new Firebase.CompletionListener() {
                            @Override
                            public void onComplete(FirebaseError firebaseError, Firebase firebase) {
                                mapEntrySet.remove(mapEntry);

                                if (mapEntrySet.iterator().hasNext()) {
                                    removeFirebaseVal(mapEntrySet);
                                }
                                else{
                                    if(firebaseError != null) {
                                        callback.invoke(false);
                                    }
                                    else{
                                        callback.invoke(true);
                                    }
                                }
                            }
                        });
            }
        }
    }
}
