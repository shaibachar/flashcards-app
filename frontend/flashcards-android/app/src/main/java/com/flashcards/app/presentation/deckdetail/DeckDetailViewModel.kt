package com.flashcards.app.presentation.deckdetail

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.flashcards.app.data.repository.DecksRepository
import com.flashcards.app.domain.model.Deck
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import timber.log.Timber
import javax.inject.Inject

data class DeckDetailUiState(
    val deck: Deck? = null,
    val isLoading: Boolean = false,
    val error: String? = null
)

@HiltViewModel
class DeckDetailViewModel @Inject constructor(
    private val decksRepository: DecksRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(DeckDetailUiState())
    val uiState: StateFlow<DeckDetailUiState> = _uiState.asStateFlow()

    private var currentDeckId: String? = null

    fun loadDeck(deckId: String) {
        currentDeckId = deckId
        fetchDeck()
    }

    fun refreshDeck() {
        currentDeckId?.let { fetchDeck() }
    }

    private fun fetchDeck() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, error = null) }
            
            try {
                val decks = decksRepository.getDecks()
                val deck = decks.find { it.id == currentDeckId }
                
                if (deck != null) {
                    _uiState.update { it.copy(deck = deck, isLoading = false) }
                } else {
                    _uiState.update { 
                        it.copy(
                            isLoading = false,
                            error = "Deck not found"
                        )
                    }
                }
            } catch (e: Exception) {
                Timber.e(e, "Failed to load deck")
                _uiState.update { 
                    it.copy(
                        isLoading = false,
                        error = e.message ?: "An unexpected error occurred"
                    )
                }
            }
        }
    }
}
