package com.flashcards.app.presentation.navigation

sealed class Screen(val route: String) {
    object Login : Screen("login")
    object Home : Screen("home")
    object DeckList : Screen("decks")
    object DeckDetail : Screen("deck/{deckId}") {
        fun createRoute(deckId: String) = "deck/$deckId"
    }
    object FlashcardManagement : Screen("deck/{deckId}/flashcards") {
        fun createRoute(deckId: String) = "deck/$deckId/flashcards"
    }
    object Study : Screen("study/{deckId}") {
        fun createRoute(deckId: String) = "study/$deckId"
    }
    object LearningPathList : Screen("learning-paths")
    object LearningPathDetail : Screen("learning-path/{pathId}") {
        fun createRoute(pathId: String) = "learning-path/$pathId"
    }
    object Settings : Screen("settings")
    object Profile : Screen("profile")
}
