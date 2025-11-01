package com.flashcards.app.domain.model

data class Deck(
    val id: String,
    val name: String,
    val description: String = "",
    val flashcards: List<Flashcard> = emptyList(),
    val userId: String,
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis(),
    val isPublic: Boolean = false,
    val tags: List<String> = emptyList()
) {
    val flashcardCount: Int
        get() = flashcards.size
}
