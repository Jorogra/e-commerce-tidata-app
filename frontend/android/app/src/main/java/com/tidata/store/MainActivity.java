package com.tidata.store;

import android.os.Bundle;
import android.os.Handler;
import androidx.core.splashscreen.SplashScreen;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private boolean keepShowing = true; // Controla se a splash deve sumir

    @Override
    public void onCreate(Bundle savedInstanceState) {
        SplashScreen splashScreen = SplashScreen.installSplashScreen(this);
        super.onCreate(savedInstanceState);

        // Isso força a Splash a ficar na tela enquanto 'keepShowing' for true
        splashScreen.setKeepOnScreenCondition(() -> keepShowing);

        // Define o tempo exato (3500ms) para liberar a tela
        new Handler().postDelayed(() -> {
            keepShowing = false;
        }, 3500); 
    }
}