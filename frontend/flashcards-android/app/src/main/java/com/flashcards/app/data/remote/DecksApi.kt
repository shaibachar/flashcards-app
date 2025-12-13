package com.flashcards.app.data.remote

import com.flashcards.app.domain.model.Deck
import retrofit2.http.GET
import retrofit2.http.Header

interface DecksApi {
    @GET("decks")
    suspend fun getDecks(
        @Header("Authorization") token: String? = null
    ): List<DeckResponse>
}

data class DeckResponse(
    val id: String?,
    val name: String?,
    val description: String?,
    val userId: String?,
    val createdAt: Long?,
    val updatedAt: Long?,
    val isPublic: Boolean?,
    val tags: List<String>?
)

fun DeckResponse.toDomain(): Deck {
    return Deck(
        id = id ?: "",
        name = name ?: "Untitled Deck",
        description = description ?: "",
        flashcards = emptyList(), // Will be loaded separately when needed
        userId = userId ?: "",
        createdAt = createdAt ?: System.currentTimeMillis(),
        updatedAt = updatedAt ?: System.currentTimeMillis(),
        isPublic = isPublic ?: false,
        tags = tags ?: emptyList()
    )
}
