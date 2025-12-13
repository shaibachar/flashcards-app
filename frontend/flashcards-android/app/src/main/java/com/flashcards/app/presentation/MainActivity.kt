package com.flashcards.app.presentation

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import com.flashcards.app.presentation.navigation.FlashcardsNavGraph
import com.flashcards.app.presentation.navigation.Screen
import com.flashcards.app.presentation.theme.FlashcardsAndroidTheme
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    private val viewModel: MainViewModel by viewModels()
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        
        setContent {
            FlashcardsAndroidTheme {
                val isLoggedIn by viewModel.isLoggedIn.collectAsState()
                
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    FlashcardsNavGraph(
                        startDestination = if (isLoggedIn) Screen.Home.route else Screen.Login.route
                    )
                }
            }
        }
    }
}
