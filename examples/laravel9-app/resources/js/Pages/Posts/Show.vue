<script setup lang="ts">
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import { Post } from '@/types/model';
import { Head, usePage } from '@inertiajs/vue3';

const page = usePage<{ post: Post }>()
</script>
<template>

    <Head title="Post" />

    <AuthenticatedLayout>
        <div class="py-12">
            <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
                <div>ID: {{ route<'posts.show'>().params.post }}</div>
                <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg p-12">
                    <h2>{{ page.props.post.title }}</h2>
                    <p>{{ page.props.post.body }}</p>
                </div>
            </div>
        </div>
    </AuthenticatedLayout>

</template>
