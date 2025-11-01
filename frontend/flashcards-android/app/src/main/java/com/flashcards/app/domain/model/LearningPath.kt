package com.flashcards.app.domain.model

data class LearningPath(
    val id: String,
    val name: String,
    val description: String,
    val decks: List<Deck> = emptyList(),
    val userId: String,
    val isPublic: Boolean = false,
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis()
) {
    val totalFlashcards: Int
        get() = decks.sumOf { it.flashcardCount }
}
