package com.flashcards.app.data.repository

import com.flashcards.app.data.remote.DecksApi
import com.flashcards.app.data.remote.toDomain
import com.flashcards.app.domain.model.Deck
import retrofit2.HttpException
import timber.log.Timber
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DecksRepository @Inject constructor(
    private val decksApi: DecksApi,
    private val authRepository: AuthRepository
) {
    suspend fun getDecks(): List<Deck> {
        try {
            val token = authRepository.getAuthToken()
            Timber.d("Fetching decks with token: ${token?.take(10)}...")
            val response = decksApi.getDecks(token)
            Timber.d("Successfully fetched ${response.size} decks")
            return response.map { it.toDomain() }
        } catch (e: HttpException) {
            val errorBody = e.response()?.errorBody()?.string()
            val errorMsg = "HTTP ${e.code()}: ${e.message()}\nURL: ${e.response()?.raw()?.request?.url}\nResponse: $errorBody"
            Timber.e(e, errorMsg)
            throw Exception(errorMsg, e)
        } catch (e: Exception) {
            Timber.e(e, "Failed to fetch decks")
            throw e
        }
    }
}
