package com.flashcards.app.domain.model

data class User(
    val id: String,
    val username: String,
    val email: String,
    val role: UserRole = UserRole.USER,
    val createdAt: Long = System.currentTimeMillis()
)

enum class UserRole {
    USER,
    ADMIN
}
