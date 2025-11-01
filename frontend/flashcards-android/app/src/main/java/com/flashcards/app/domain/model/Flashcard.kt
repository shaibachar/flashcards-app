package com.flashcards.app.domain.model

data class Flashcard(
    val id: String,
    val question: String,
    val answer: String,
    val deckId: String,
    val hint: String? = null,
    val imageUrl: String? = null,
    val difficulty: Difficulty = Difficulty.MEDIUM,
    val tags: List<String> = emptyList(),
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis(),
    var localScore: Int = 0
)

enum class Difficulty {
    EASY,
    MEDIUM,
    HARD
}
