package com.flashcards.app.presentation.navigation

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.flashcards.app.presentation.auth.LoginScreen
import com.flashcards.app.presentation.home.HomeScreen

@Composable
fun FlashcardsNavGraph(
    modifier: Modifier = Modifier,
    navController: NavHostController = rememberNavController(),
    startDestination: String = Screen.Login.route
) {
    NavHost(
        navController = navController,
        startDestination = startDestination,
        modifier = modifier
    ) {
        // Auth
        composable(Screen.Login.route) {
            LoginScreen(
                onLoginSuccess = {
                    navController.navigate(Screen.Home.route) {
                        popUpTo(Screen.Login.route) { inclusive = true }
                    }
                }
            )
        }

        // Home
        composable(Screen.Home.route) {
            HomeScreen(
                onNavigateToDecks = {
                    navController.navigate(Screen.DeckList.route)
                },
                onNavigateToLearningPaths = {
                    navController.navigate(Screen.LearningPathList.route)
                },
                onNavigateToSettings = {
                    navController.navigate(Screen.Settings.route)
                },
                onLogout = {
                    navController.navigate(Screen.Login.route) {
                        popUpTo(0) { inclusive = true }
                    }
                }
            )
        }

        // Decks
        composable(Screen.DeckList.route) {
            // TODO: Implement DeckListScreen
        }

        composable(
            route = Screen.DeckDetail.route,
            arguments = listOf(navArgument("deckId") { type = NavType.StringType })
        ) {
            // TODO: Implement DeckDetailScreen
        }

        composable(
            route = Screen.FlashcardManagement.route,
            arguments = listOf(navArgument("deckId") { type = NavType.StringType })
        ) {
            // TODO: Implement FlashcardManagementScreen
        }

        composable(
            route = Screen.Study.route,
            arguments = listOf(navArgument("deckId") { type = NavType.StringType })
        ) {
            // TODO: Implement StudyScreen
        }

        // Learning Paths
        composable(Screen.LearningPathList.route) {
            // TODO: Implement LearningPathListScreen
        }

        composable(
            route = Screen.LearningPathDetail.route,
            arguments = listOf(navArgument("pathId") { type = NavType.StringType })
        ) {
            // TODO: Implement LearningPathDetailScreen
        }

        // Settings
        composable(Screen.Settings.route) {
            // TODO: Implement SettingsScreen
        }

        composable(Screen.Profile.route) {
            // TODO: Implement ProfileScreen
        }
    }
}
