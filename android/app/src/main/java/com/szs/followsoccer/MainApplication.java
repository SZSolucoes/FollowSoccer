package com.szs.followsoccer;

import android.app.Application;

import com.facebook.react.ReactApplication;
import com.learnium.RNDeviceInfo.RNDeviceInfo;
import com.dylanvann.fastimage.FastImageViewPackage;
import com.RNFetchBlob.RNFetchBlobPackage;
import com.oblador.vectoricons.VectorIconsPackage;
import com.horcrux.svg.SvgPackage;
import cl.json.RNSharePackage;
import cl.json.ShareApplication;
import com.reactnative.ivpusic.imagepicker.PickerPackage;
import com.evollu.react.fcm.FIRMessagingPackage;
import fr.greweb.rnwebgl.RNWebGLPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;

import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ShareApplication, ReactApplication {

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          new MainReactPackage(),
            new RNDeviceInfo(),
            new FastImageViewPackage(),
            new RNFetchBlobPackage(),
            new VectorIconsPackage(),
            new SvgPackage(),
            new RNSharePackage(),
            new PickerPackage(),
            new FIRMessagingPackage(),
            new RNWebGLPackage()
      );
    }

    @Override
    protected String getJSMainModuleName() {
      return "index";
    }
  };

  @Override
  public String getFileProviderAuthority() {
    return "com.szs.followsoccer.provider";
  }

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
  }
}
